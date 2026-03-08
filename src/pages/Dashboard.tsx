import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Users, Handshake, DollarSign, TrendingUp, Phone, Mail, Calendar, StickyNote, CheckSquare } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area 
} from 'recharts';
import { formatDistanceToNow, format, parseISO, startOfMonth } from 'date-fns';
import { useContacts } from '../hooks/useContacts';
import { useDeals } from '../hooks/useDeals';
import { useActivities } from '../hooks/useActivities';
import { StatsCard } from '../components/StatsCard';

const currencyFormatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

const COLORS = ['#6366f1', '#f59e0b', '#10b981', '#ec4899', '#8b5cf6'];

export const Dashboard = () => {
  const { contacts, loading: cLoading } = useContacts();
  const { deals, loading: dLoading } = useDeals();
  const { activities, loading: aLoading } = useActivities();

  const stats = useMemo(() => {
    const activeDeals = deals.filter(d => !['closed_won', 'closed_lost'].includes(d.stage));
    const pipelineValue = activeDeals.reduce((sum, d) => sum + Number(d.value), 0);
    const wonRevenue = deals.filter(d => d.stage === 'closed_won').reduce((sum, d) => sum + Number(d.value), 0);

    return {
      totalContacts: contacts.length,
      activeDeals: activeDeals.length,
      pipelineValue: currencyFormatter.format(pipelineValue),
      wonRevenue: currencyFormatter.format(wonRevenue)
    };
  }, [contacts, deals]);

  const pipelineData = useMemo(() => {
    const stages = { discovery: 0, proposal: 0, negotiation: 0, closed_won: 0, closed_lost: 0 };
    deals.forEach(d => stages[d.stage]++);
    return Object.entries(stages).map(([name, value]) => ({
      name: name.split('_').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' '),
      value
    }));
  }, [deals]);

  const sourceData = useMemo(() => {
    const sources: Record<string, number> = {};
    contacts.forEach(c => {
      sources[c.source] = (sources[c.source] || 0) + 1;
    });
    return Object.entries(sources).map(([name, value]) => ({ name, value }));
  }, [contacts]);

  const revenueData = useMemo(() => {
    const months: Record<string, number> = {};
    deals.filter(d => d.stage === 'closed_won').forEach(d => {
      const month = format(parseISO(d.created_at), 'MMM');
      months[month] = (months[month] || 0) + Number(d.value);
    });
    return Object.entries(months).map(([name, value]) => ({ name, value }));
  }, [deals]);

  if (cLoading || dLoading || aLoading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>;
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      {/* Row 1: Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard title="Total Contacts" value={stats.totalContacts} icon={<Users size={24} />} color="blue" />
        <StatsCard title="Active Deals" value={stats.activeDeals} icon={<Handshake size={24} />} color="amber" />
        <StatsCard title="Pipeline Value" value={stats.pipelineValue} icon={<DollarSign size={24} />} color="green" />
        <StatsCard title="Won Revenue" value={stats.wonRevenue} icon={<TrendingUp size={24} />} color="emerald" />
      </div>

      {/* Row 2: Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold mb-6">Deal Pipeline</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pipelineData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={12} />
                <YAxis axisLine={false} tickLine={false} fontSize={12} />
                <Tooltip cursor={{fill: '#f9fafb'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold mb-6">Contact Sources</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={sourceData} innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                  {sourceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 3: Revenue & Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold mb-6">Revenue Growth</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={12} />
                <YAxis axisLine={false} tickLine={false} fontSize={12} tickFormatter={(v) => `$${v/1000}k`} />
                <Tooltip />
                <Area type="monotone" dataKey="value" stroke="#6366f1" fillOpacity={1} fill="url(#colorRev)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold mb-6">Recent Activities</h3>
          <div className="space-y-4">
            {activities.slice(0, 5).map((activity) => (
              <div key={activity.id} className="flex items-start gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                  {activity.type === 'call' && <Phone size={16} />}
                  {activity.type === 'email' && <Mail size={16} />}
                  {activity.type === 'meeting' && <Calendar size={16} />}
                  {activity.type === 'note' && <StickyNote size={16} />}
                  {activity.type === 'task' && <CheckSquare size={16} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{activity.description}</p>
                  <p className="text-xs text-gray-500">
                    {formatDistanceToNow(parseISO(activity.created_at))} ago
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
