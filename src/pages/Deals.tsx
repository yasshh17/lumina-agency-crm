import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { LayoutGrid, List, Plus, MoreVertical, Calendar, DollarSign, X, Edit2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { useDeals } from '../hooks/useDeals';
import { useContacts } from '../hooks/useContacts';
import type { Deal, DealStage } from '../types';

const currencyFormatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

const STAGES: { id: DealStage; label: string }[] = [
  { id: 'discovery', label: 'Discovery' },
  { id: 'proposal', label: 'Proposal' },
  { id: 'negotiation', label: 'Negotiation' },
  { id: 'closed_won', label: 'Closed Won' },
  { id: 'closed_lost', label: 'Closed Lost' },
];

export const Deals = () => {
  const { deals, loading, createDeal, updateDeal, deleteDeal } = useDeals();
  const { contacts } = useContacts();
  const [view, setView] = useState<'pipeline' | 'table'>('pipeline');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    
    try {
      if (editingDeal) {
        await updateDeal(editingDeal.id, data as any);
      } else {
        await createDeal(data as any);
      }
      setIsModalOpen(false);
      setEditingDeal(null);
    } catch (err) {
      alert('Error saving deal');
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex bg-white border border-gray-200 rounded-lg p-1">
          <button 
            onClick={() => setView('pipeline')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${view === 'pipeline' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <LayoutGrid size={16} /> Pipeline
          </button>
          <button 
            onClick={() => setView('table')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${view === 'table' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <List size={16} /> Table
          </button>
        </div>
        <button 
          onClick={() => { setEditingDeal(null); setIsModalOpen(true); }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus size={18} /> Add Deal
        </button>
      </div>

      {view === 'pipeline' ? (
        <div className="flex gap-6 overflow-x-auto pb-4 min-h-[600px]">
          {STAGES.map((stage) => {
            const stageDeals = deals.filter(d => d.stage === stage.id);
            return (
              <div key={stage.id} className="flex-shrink-0 w-80">
                <div className={`flex items-center justify-between mb-4 p-3 rounded-lg border-b-2 ${
                  stage.id === 'closed_won' ? 'bg-green-50 border-green-500 text-green-700' :
                  stage.id === 'closed_lost' ? 'bg-red-50 border-red-500 text-red-700' :
                  'bg-gray-50 border-gray-300 text-gray-700'
                }`}>
                  <h3 className="font-semibold text-sm uppercase tracking-wider">{stage.label}</h3>
                  <span className="text-xs font-bold bg-white/50 px-2 py-0.5 rounded-full">{stageDeals.length}</span>
                </div>
                <div className="space-y-4">
                  {stageDeals.map((deal) => (
                    <motion.div 
                      layoutId={deal.id}
                      key={deal.id} 
                      className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:border-indigo-300 transition-colors group relative"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-gray-900 leading-tight">{deal.title}</h4>
                        <div className="relative group/menu">
                          <button className="p-1 text-gray-400 hover:text-gray-600"><MoreVertical size={16} /></button>
                          <div className="absolute right-0 top-full mt-1 hidden group-hover/menu:block bg-white border border-gray-100 shadow-lg rounded-lg py-1 z-10 w-32">
                            <button onClick={() => { setEditingDeal(deal); setIsModalOpen(true); }} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50">Edit</button>
                            <button onClick={() => window.confirm('Delete deal?') && deleteDeal(deal.id)} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 text-red-600">Delete</button>
                          </div>
                        </div>
                      </div>
                      <div className="text-lg font-bold text-indigo-600 mb-3">
                        {currencyFormatter.format(deal.value)}
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-bold">
                            {deal.contact?.name.charAt(0)}
                          </div>
                          {deal.contact?.name || 'No contact'}
                        </div>
                        {deal.expected_close && (
                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            <Calendar size={12} />
                            {format(parseISO(deal.expected_close), 'MMM d, yyyy')}
                          </div>
                        )}
                      </div>
                      <div className="mt-4 pt-4 border-t border-gray-50">
                        <select 
                          value={deal.stage}
                          onChange={(e) => updateDeal(deal.id, { stage: e.target.value as DealStage })}
                          className="w-full text-xs bg-gray-50 border-none rounded-md px-2 py-1.5 focus:ring-0 cursor-pointer"
                        >
                          {STAGES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                        </select>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Title</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Value</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Stage</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Contact</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Expected Close</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {deals.map((deal) => (
                <tr key={deal.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">{deal.title}</td>
                  <td className="px-6 py-4 text-indigo-600 font-semibold">{currencyFormatter.format(deal.value)}</td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 capitalize">
                      {deal.stage.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{deal.contact?.name}</td>
                  <td className="px-6 py-4 text-gray-600">
                    {deal.expected_close ? format(parseISO(deal.expected_close), 'MMM d, yyyy') : '-'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => { setEditingDeal(deal); setIsModalOpen(true); }} className="p-1.5 text-gray-400 hover:text-indigo-600"><Edit2 size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-lg font-semibold">{editingDeal ? 'Edit Deal' : 'Add New Deal'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Deal Title *</label>
                <input name="title" defaultValue={editingDeal?.title} required className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Value ($)</label>
                  <input name="value" type="number" defaultValue={editingDeal?.value} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stage</label>
                  <select name="stage" defaultValue={editingDeal?.stage || 'discovery'} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none">
                    {STAGES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact</label>
                <select name="contact_id" defaultValue={editingDeal?.contact_id || ''} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none">
                  <option value="">Select a contact</option>
                  {contacts.map(c => <option key={c.id} value={c.id}>{c.name} ({c.company})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expected Close</label>
                <input name="expected_close" type="date" defaultValue={editingDeal?.expected_close || ''} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
              <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 rounded-lg transition-colors">
                {editingDeal ? 'Update Deal' : 'Create Deal'}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};
