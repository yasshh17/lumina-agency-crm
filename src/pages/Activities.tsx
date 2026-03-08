import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Phone, Mail, Calendar, StickyNote, CheckSquare, Plus, Filter, X, Clock } from 'lucide-react';
import { format, formatDistanceToNow, parseISO, isPast } from 'date-fns';
import { useActivities } from '../hooks/useActivities';
import { useContacts } from '../hooks/useContacts';
import { useDeals } from '../hooks/useDeals';
import type { Activity, ActivityType } from '../types';

const typeIcons = {
  call: Phone,
  email: Mail,
  meeting: Calendar,
  note: StickyNote,
  task: CheckSquare,
};

export const Activities = () => {
  const { activities, loading, createActivity, updateActivity, deleteActivity } = useActivities();
  const { contacts } = useContacts();
  const { deals } = useDeals();
  const [filter, setFilter] = useState<ActivityType | 'all'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredActivities = activities.filter(a => filter === 'all' || a.type === filter);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    
    try {
      await createActivity({
        ...data,
        completed: formData.get('completed') === 'on'
      } as any);
      setIsModalOpen(false);
    } catch (err) {
      alert('Error logging activity');
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-wrap gap-2">
          {['all', 'call', 'email', 'meeting', 'note', 'task'].map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t as any)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors capitalize ${
                filter === t ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {t}s
            </button>
          ))}
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus size={18} /> Log Activity
        </button>
      </div>

      <div className="space-y-4">
        {filteredActivities.map((activity) => {
          const Icon = typeIcons[activity.type];
          const isOverdue = activity.due_date && isPast(parseISO(activity.due_date)) && !activity.completed;
          
          return (
            <motion.div 
              layout
              key={activity.id} 
              className={`bg-white p-5 rounded-xl shadow-sm border transition-all ${
                isOverdue ? 'border-red-200 bg-red-50/30' : 'border-gray-100'
              }`}
            >
              <div className="flex gap-4">
                <div className="flex flex-col items-center gap-2">
                  <div className={`p-3 rounded-xl ${activity.completed ? 'bg-gray-100 text-gray-400' : 'bg-indigo-50 text-indigo-600'}`}>
                    <Icon size={20} />
                  </div>
                  <input 
                    type="checkbox" 
                    checked={activity.completed}
                    onChange={(e) => updateActivity(activity.id, { completed: e.target.checked })}
                    className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <p className={`text-lg font-medium ${activity.completed ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                      {activity.description}
                    </p>
                    <button onClick={() => deleteActivity(activity.id)} className="text-gray-300 hover:text-red-500"><X size={16} /></button>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-gray-500">
                    {activity.contact && (
                      <span className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-indigo-400" />
                        {activity.contact.name}
                      </span>
                    )}
                    {activity.deal && (
                      <span className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-amber-400" />
                        {activity.deal.title}
                      </span>
                    )}
                    <span className="flex items-center gap-1.5">
                      <Clock size={14} />
                      {formatDistanceToNow(parseISO(activity.created_at))} ago
                    </span>
                    {activity.due_date && (
                      <span className={`flex items-center gap-1.5 font-medium ${isOverdue ? 'text-red-600' : ''}`}>
                        Due: {format(parseISO(activity.due_date), 'MMM d, h:mm a')}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
        {filteredActivities.length === 0 && !loading && (
          <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300 text-gray-500">
            No activities found for this filter
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-lg font-semibold">Log Activity</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select name="type" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none">
                    <option value="call">Call</option>
                    <option value="email">Email</option>
                    <option value="meeting">Meeting</option>
                    <option value="note">Note</option>
                    <option value="task">Task</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                  <input name="due_date" type="datetime-local" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                <textarea name="description" required rows={3} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="What happened?"></textarea>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact</label>
                  <select name="contact_id" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none">
                    <option value="">None</option>
                    {contacts.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Deal</label>
                  <select name="deal_id" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none">
                    <option value="">None</option>
                    {deals.map(d => <option key={d.id} value={d.id}>{d.title}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" name="completed" id="completed" className="w-4 h-4 rounded border-gray-300 text-indigo-600" />
                <label htmlFor="completed" className="text-sm font-medium text-gray-700">Mark as completed</label>
              </div>
              <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 rounded-lg transition-colors">
                Log Activity
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};
