import React, { useState, useEffect } from 'react';
import { dashboardService } from '../api';
import { useStore } from '../store';
import { 
  TrendingUp, 
  Users, 
  Target, 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownRight,
  MoreVertical,
  Brain,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { motion } from 'framer-motion';





const StatCard = ({ title, value, icon: Icon, trend, trendValue, color }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="glass-card p-6 relative overflow-hidden group"
  >
    <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full bg-${color}-500/10 blur-2xl group-hover:bg-${color}-500/20 transition-all duration-500`} />
    
    <div className="flex items-center justify-between mb-4">
      <div className={`p-3 rounded-xl bg-${color}-500/10 text-${color}-400`}>
        <Icon size={24} />
      </div>
      <button className="text-slate-500 hover:text-white transition-colors">
        <MoreVertical size={20} />
      </button>
    </div>

    <div>
      <h3 className="text-slate-400 text-sm font-medium">{title}</h3>
      <div className="flex items-end gap-3 mt-1">
        <span className="text-2xl font-bold text-white">{value}</span>
        <span className={`flex items-center text-xs font-medium pb-1 ${trend === 'up' ? 'text-emerald-400' : 'text-rose-400'}`}>
          {trend === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          {trendValue}
        </span>
      </div>
    </div>
  </motion.div>
);

const AIBrainInsight = ({ icon: Icon, title, description, actionText, type }) => {
  const styles = {
    opportunity: 'from-emerald-500/20 to-emerald-500/5 text-emerald-400 border-emerald-500/20',
    warning: 'from-amber-500/20 to-amber-500/5 text-amber-400 border-amber-500/20',
    insight: 'from-primary/20 to-primary/5 text-primary border-primary/20'
  };

  return (
    <div className={`p-4 rounded-2xl border bg-gradient-to-br ${styles[type]} flex items-start gap-4`}>
      <div className={`p-2 rounded-xl bg-white/10 mt-1`}>
        <Icon size={20} />
      </div>
      <div className="flex-1">
        <h4 className="font-semibold text-white mb-1">{title}</h4>
        <p className="text-sm text-slate-300 opacity-90 leading-relaxed mb-3">{description}</p>
        <button className="text-xs font-bold uppercase tracking-wider hover:opacity-80 transition-opacity">
          {actionText} →
        </button>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user, company } = useStore();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await dashboardService.getStats();
      setStats(response.data);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#ef4444'];
  
  const dynamicSourceData = stats?.sourceData?.map((item, index) => ({
    ...item,
    color: colors[index % colors.length]
  })) || [];

  const dynamicChartData = stats?.chartData || [];

  return (
    <div className="p-8 space-y-8 w-full">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          {/* Company badge */}
          {company && (
            <div className="flex items-center gap-2 mb-2">
              {company.logoUrl && (
                <img src={company.logoUrl} alt={company.name} className="w-5 h-5 rounded-md" />
              )}
              <span
                className="text-xs font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border"
                style={{ color: company.primaryColor || '#6366f1', borderColor: (company.primaryColor || '#6366f1') + '40', backgroundColor: (company.primaryColor || '#6366f1') + '15' }}
              >
                {company.name} Workspace
              </span>
            </div>
          )}
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            Welcome back, {user?.username || 'User'}!
            <span className="px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-bold uppercase tracking-widest border border-primary/20 flex items-center gap-1">
              <Sparkles size={12} /> Flow AI Active
            </span>
          </h1>
          <p className="text-slate-500 mt-1">
            {company ? `${company.name}'s AI-curated operational overview for today.` : "Here is your AI-curated operational overview for today."}
          </p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 rounded-xl glass border-white/5 text-sm font-medium hover:bg-white/5 transition-all">
            Export Report
          </button>
          <button className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary-hover shadow-lg shadow-primary/20 transition-all flex items-center gap-2">
            <Brain size={18} />
            Generate AI Strategy
          </button>
        </div>
      </header>

      {/* AI Business Brain Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6 border border-primary/20 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px]" />
        
        <div className="flex items-center gap-3 mb-6 relative z-10">
          <div className="p-2 rounded-xl bg-primary/20 text-primary">
            <Brain size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">AI Business Brain</h2>
            <p className="text-sm text-slate-400">Predictive insights and recommended next-best-actions</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
          <AIBrainInsight 
            icon={Target}
            type="opportunity"
            title="High Intent Leads Detected"
            description={`${stats?.funnelData?.find(d => d.name === 'Negotiation')?.value || 0} leads are currently in negotiation phase with high purchase intent.`}
            actionText="Review & Engage"
          />
          <AIBrainInsight 
            icon={AlertCircle}
            type="warning"
            title="Pipeline Risk Alert"
            description="Several early-stage deals are stagnant. Immediate follow-up required to prevent drop-off."
            actionText="Trigger Re-engagement"
          />
          <AIBrainInsight 
            icon={TrendingUp}
            type="insight"
            title="Campaign Optimization"
            description="Your recent email drip campaign has a 12% higher open rate on Tuesdays. AI suggests rescheduling upcoming blasts."
            actionText="Apply Suggestion"
          />
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Leads" value={loading ? '...' : (stats?.totalLeads || 0).toLocaleString()} icon={Users} trend="up" trendValue="+12.5%" color="indigo" />
        <StatCard title="Active Deals" value={loading ? '...' : (stats?.activeDeals || 0).toLocaleString()} icon={Target} trend="up" trendValue="+4.2%" color="violet" />
        <StatCard title="Conversion Rate" value={loading ? '...' : `${(stats?.winRate || 0).toFixed(1)}%`} icon={TrendingUp} trend="down" trendValue="-1.4%" color="emerald" />
        <StatCard title="Total Revenue" value={loading ? '...' : `$${(stats?.pipelineValue || 0).toLocaleString()}`} icon={DollarSign} trend="up" trendValue="+18.7%" color="amber" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="lg:col-span-2 glass-card p-6"
        >
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-lg font-semibold text-white">Lead Performance</h2>
            <select className="bg-slate-900 border border-white/5 rounded-lg px-3 py-1.5 text-xs text-slate-400 outline-none">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
          </div>
          <div className="h-[300px] w-full relative">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} debounce={50}>
              <AreaChart data={dynamicChartData}>
                <defs>
                  <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="#64748b" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                />
                <YAxis 
                  stroke="#64748b" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false}
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }}
                  itemStyle={{ color: '#6366f1' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="leads" 
                  stroke="#6366f1" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorLeads)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Sources Chart */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card p-6"
        >
          <h2 className="text-lg font-semibold text-white mb-8">Traffic Sources</h2>
          <div className="h-[250px] w-full relative">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} debounce={50}>
              <BarChart data={dynamicSourceData}>
                <XAxis dataKey="name" hide />
                <YAxis hide />
                <Tooltip 
                  cursor={{fill: 'transparent'}}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                />
                <Bar dataKey="value" radius={[10, 10, 10, 10]}>
                  {dynamicSourceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-4 mt-6">
            {dynamicSourceData.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-sm text-slate-400">{item.name}</span>
                </div>
                <span className="text-sm font-medium text-white">{item.value}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
