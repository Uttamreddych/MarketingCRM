import React, { useState, useEffect } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart, Pie, Legend
} from 'recharts';
import { leadService } from '../api';
import { Loader2, Download, TrendingUp, Filter } from 'lucide-react';

const Analytics = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const response = await leadService.getAll();
      setLeads(response.data);
    } catch (error) {
      console.error("Error fetching leads for analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  // 1. Funnel Data
  const statuses = ['New Lead', 'Contacted', 'Interested', 'Negotiation', 'Won'];
  const funnelData = statuses.map(status => ({
    name: status,
    value: leads.filter(l => l.status === status).length
  }));

  // 2. Source Data
  const sourceMap = leads.reduce((acc, lead) => {
    const source = lead.source || 'Unknown';
    acc[source] = (acc[source] || 0) + 1;
    return acc;
  }, {});
  
  const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#ef4444'];
  const sourceData = Object.keys(sourceMap).map((key, index) => ({
    name: key,
    value: sourceMap[key],
    color: COLORS[index % COLORS.length]
  })).sort((a, b) => b.value - a.value);

  // 3. AI Probability Distribution
  const probMap = { '0-25%': 0, '26-50%': 0, '51-75%': 0, '76-100%': 0 };
  leads.forEach(l => {
    const prob = l.conversionProbability || 0;
    if (prob <= 25) probMap['0-25%']++;
    else if (prob <= 50) probMap['26-50%']++;
    else if (prob <= 75) probMap['51-75%']++;
    else probMap['76-100%']++;
  });
  
  const probData = Object.keys(probMap).map(key => ({
    name: key,
    value: probMap[key]
  }));

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-80px)] items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  return (
    <div className="p-8 w-full space-y-8 h-[calc(100vh-80px)] overflow-y-auto custom-scrollbar">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Advanced Analytics</h1>
          <p className="text-slate-500 mt-1">Deep dive into your CRM data and performance metrics.</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 rounded-xl glass border-white/5 text-sm font-medium hover:bg-white/5 transition-all flex items-center gap-2">
            <Filter size={16} />
            Filters
          </button>
          <button className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary-hover shadow-lg shadow-primary/20 transition-all flex items-center gap-2">
            <Download size={16} />
            Export CSV
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Sales Funnel Chart */}
        <div className="glass-card p-6 border border-white/5">
          <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
            <TrendingUp size={20} className="text-primary" />
            Sales Pipeline Funnel
          </h2>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <BarChart data={funnelData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={true} vertical={false} />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} width={100} />
                <Tooltip 
                  cursor={{fill: 'transparent'}}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                />
                <Bar dataKey="value" fill="#6366f1" radius={[0, 10, 10, 0]} barSize={32}>
                  {funnelData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sources Pie Chart */}
        <div className="glass-card p-6 border border-white/5">
          <h2 className="text-lg font-semibold text-white mb-6">Lead Sources Distribution</h2>
          <div className="h-[300px] w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <PieChart>
                <Pie
                  data={sourceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={110}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {sourceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Conversion Probability Distribution */}
        <div className="glass-card p-6 border border-white/5 lg:col-span-2">
          <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
            AI Conversion Probability Distribution
          </h2>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <AreaChart data={probData}>
                <defs>
                  <linearGradient id="colorProb" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                />
                <Area type="monotone" dataKey="value" stroke="#10b981" strokeWidth={3} fill="url(#colorProb)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Analytics;
