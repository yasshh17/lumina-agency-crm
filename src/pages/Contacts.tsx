import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Plus, Edit2, Trash2, X } from 'lucide-react';
import { useContacts } from '../hooks/useContacts';
import type { Contact, ContactStatus, ContactSource } from '../types';

export const Contacts = () => {
  const { contacts, loading, createContact, updateContact, deleteContact } = useContacts();
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);

  const filteredContacts = contacts.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase()) ||
    c.company?.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    
    try {
      if (editingContact) {
        await updateContact(editingContact.id, data as any);
      } else {
        await createContact(data as any);
      }
      setIsModalOpen(false);
      setEditingContact(null);
    } catch (err) {
      alert('Error saving contact');
    }
  };

  const statusColors = {
    client: 'bg-green-100 text-green-700',
    prospect: 'bg-yellow-100 text-yellow-700',
    lead: 'bg-blue-100 text-blue-700',
    churned: 'bg-red-100 text-red-700',
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search contacts..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button 
          onClick={() => { setEditingContact(null); setIsModalOpen(true); }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus size={18} /> Add Contact
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Name</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Email</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Company</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Status</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Source</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredContacts.map((contact) => (
                <tr key={contact.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-6 py-4 font-medium text-gray-900">{contact.name}</td>
                  <td className="px-6 py-4 text-gray-600">{contact.email}</td>
                  <td className="px-6 py-4 text-gray-600">{contact.company}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[contact.status]}`}>
                      {contact.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600 capitalize">{contact.source}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => { setEditingContact(contact); setIsModalOpen(true); }}
                        className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => window.confirm('Delete contact?') && deleteContact(contact.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredContacts.length === 0 && !loading && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">No contacts found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-lg font-semibold">{editingContact ? 'Edit Contact' : 'Add New Contact'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                <input name="name" defaultValue={editingContact?.name} required className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input name="email" type="email" defaultValue={editingContact?.email || ''} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input name="phone" defaultValue={editingContact?.phone || ''} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                <input name="company" defaultValue={editingContact?.company || ''} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select name="status" defaultValue={editingContact?.status || 'lead'} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none">
                    <option value="lead">Lead</option>
                    <option value="prospect">Prospect</option>
                    <option value="client">Client</option>
                    <option value="churned">Churned</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
                  <select name="source" defaultValue={editingContact?.source || 'direct'} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none">
                    <option value="direct">Direct</option>
                    <option value="website">Website</option>
                    <option value="social">Social</option>
                    <option value="referral">Referral</option>
                    <option value="event">Event</option>
                  </select>
                </div>
              </div>
              <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 rounded-lg transition-colors">
                {editingContact ? 'Update Contact' : 'Create Contact'}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};
