import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Megaphone, 
  Plus, 
  Search, 
  MoreVertical,
  MousePointerClick,
  MailOpen,
  DollarSign,
  TrendingUp,
  Loader2,
  Calendar
} from 'lucide-react';
import { campaignService } from '../api';

const CampaignCard = ({ campaign }) => (
  <motion.div 
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    className="glass-card p-6 border border-white/5 hover:border-primary/30 transition-all group"
  >
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-3">
        <div className={`p-2.5 rounded-xl ${
          campaign.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400' : 
          campaign.status === 'Paused' ? 'bg-amber-500/10 text-amber-400' : 'bg-slate-500/10 text-slate-400'
        }`}>
          <Megaphone size={20} />
        </div>
        <div>
          <h3 className="text-white font-bold">{campaign.name}</h3>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mt-0.5">
            <span className="uppercase tracking-wider">{campaign.type}</span>
            <span className="w-1 h-1 rounded-full bg-slate-600" />
            <span className={
              campaign.status === 'Active' ? 'text-emerald-400' : 
              campaign.status === 'Paused' ? 'text-amber-400' : ''
            }>{campaign.status}</span>
          </div>
        </div>
      </div>
      <button className="text-slate-500 hover:text-white transition-colors">
        <MoreVertical size={20} />
      </button>
    </div>

    <div className="grid grid-cols-2 gap-4 mb-5">
      <div className="bg-slate-900/50 rounded-lg p-3 border border-white/5">
        <div className="flex items-center gap-2 text-slate-400 mb-1">
          <MailOpen size={14} />
          <span className="text-xs font-medium uppercase tracking-wider">Sent</span>
        </div>
        <p className="text-lg font-bold text-white">{campaign.sentCount.toLocaleString()}</p>
      </div>
      <div className="bg-slate-900/50 rounded-lg p-3 border border-white/5">
        <div className="flex items-center gap-2 text-slate-400 mb-1">
          <MousePointerClick size={14} />
          <span className="text-xs font-medium uppercase tracking-wider">Clicks</span>
        </div>
        <p className="text-lg font-bold text-white">{campaign.clickCount.toLocaleString()}</p>
      </div>
    </div>

    <div className="pt-4 border-t border-white/5 flex items-center justify-between">
      <div className="flex flex-col">
        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Budget Spent</span>
        <span className="text-sm font-bold text-white">${campaign.spent.toLocaleString()} / ${campaign.budget.toLocaleString()}</span>
      </div>
      
      <div className="w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden">
        <div 
          className="h-full bg-primary rounded-full" 
          style={{ width: `${Math.min(100, (campaign.spent / campaign.budget) * 100)}%` }} 
        />
      </div>
    </div>
  </motion.div>
);

const Campaigns = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const response = await campaignService.getAll();
      setCampaigns(response.data);
    } catch (error) {
      console.error("Error fetching campaigns:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCampaigns = campaigns.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const totalSpent = campaigns.reduce((acc, curr) => acc + curr.spent, 0);
  const totalBudget = campaigns.reduce((acc, curr) => acc + curr.budget, 0);
  const totalClicks = campaigns.reduce((acc, curr) => acc + curr.clickCount, 0);

  return (
    <div className="p-8 w-full space-y-8 h-[calc(100vh-80px)] overflow-y-auto custom-scrollbar">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Campaigns</h1>
          <p className="text-slate-500 mt-1">Manage and track your marketing automation.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              type="text" 
              placeholder="Search campaigns..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-900 border border-white/5 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-primary/50 text-white w-64 transition-all"
            />
          </div>
          <button className="px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary-hover shadow-lg shadow-primary/20 transition-all flex items-center gap-2">
            <Plus size={18} />
            New Campaign
          </button>
        </div>
      </header>

      {/* Aggregate Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 flex items-center gap-4">
          <div className="p-4 rounded-2xl bg-primary/10 text-primary">
            <DollarSign size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-400">Total Ad Spend</p>
            <div className="flex items-end gap-2 mt-1">
              <span className="text-2xl font-bold text-white">${totalSpent.toLocaleString()}</span>
              <span className="text-xs font-medium text-emerald-400 mb-1 flex items-center">
                <TrendingUp size={12} className="mr-1" />
                Under budget
              </span>
            </div>
          </div>
        </div>

        <div className="glass-card p-6 flex items-center gap-4">
          <div className="p-4 rounded-2xl bg-violet-500/10 text-violet-400">
            <MousePointerClick size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-400">Total Conversions</p>
            <div className="flex items-end gap-2 mt-1">
              <span className="text-2xl font-bold text-white">{totalClicks.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="glass-card p-6 flex items-center gap-4">
          <div className="p-4 rounded-2xl bg-amber-500/10 text-amber-400">
            <Calendar size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-400">Active Campaigns</p>
            <div className="flex items-end gap-2 mt-1">
              <span className="text-2xl font-bold text-white">
                {campaigns.filter(c => c.status === 'Active').length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="animate-spin text-primary" size={40} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCampaigns.map(campaign => (
            <CampaignCard key={campaign.id} campaign={campaign} />
          ))}
          {filteredCampaigns.length === 0 && (
            <div className="col-span-full py-12 text-center text-slate-500">
              No campaigns found.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Campaigns;
