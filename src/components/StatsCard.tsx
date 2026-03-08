import React from 'react';
import { motion } from 'framer-motion';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: 'blue' | 'amber' | 'green' | 'emerald';
}

const colorMap = {
  blue: 'bg-blue-50 text-blue-600',
  amber: 'bg-amber-50 text-amber-600',
  green: 'bg-green-50 text-green-600',
  emerald: 'bg-emerald-50 text-emerald-600',
};

export const StatsCard = ({ title, value, icon, color }: StatsCardProps) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
  >
    <div className="flex items-center justify-between mb-4">
      <div className={`p-3 rounded-lg ${colorMap[color]}`}>
        {icon}
      </div>
    </div>
    <p className="text-sm font-medium text-gray-500">{title}</p>
    <h3 className="text-2xl font-bold text-gray-900 mt-1">{value}</h3>
  </motion.div>
);
