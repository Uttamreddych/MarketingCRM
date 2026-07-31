import React, { useState, useEffect } from 'react';
import { User, Bell, Shield, Paintbrush, Save, Loader2, Building2, Check, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { companyService } from '../api';
import { useCompany } from '../context/CompanyContext.jsx';

const Settings = () => {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [companies, setCompanies] = useState([]);
  const { company, updateCompany } = useCompany();

  const [profile, setProfile] = useState({
    name: 'Alex Rivera',
    email: 'alex@flowcrm.ai',
    company: company?.name || 'FlowCRM Inc.',
    role: 'Administrator'
  });

  useEffect(() => {
    companyService.getAll()
      .then(res => setCompanies(res.data))
      .catch(() => {});
  }, []);

  const handleSave = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 800);
  };

  const handleSwitchCompany = (c) => {
    updateCompany(c);
  };

  const tabs = [
    { id: 'profile', label: 'My Profile', icon: User },
    { id: 'workspace', label: 'Workspace', icon: Building2 },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'appearance', label: 'Appearance', icon: Paintbrush },
  ];

  return (
    <div className="p-8 w-full h-[calc(100vh-80px)] overflow-y-auto custom-scrollbar">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-white">Settings</h1>
        <p className="text-slate-500 mt-1">Manage your account preferences and CRM configurations.</p>
      </header>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Nav */}
        <div className="w-full md:w-64 space-y-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === tab.id
                  ? 'bg-primary/10 text-primary font-medium border border-primary/20'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <tab.icon size={18} />
              {tab.label}
              {tab.id === 'workspace' && company && (
                <span className="ml-auto w-2 h-2 rounded-full" style={{ backgroundColor: company.primaryColor || '#6366f1' }} />
              )}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="glass-card p-8 border border-white/5"
            >
              {/* ===== PROFILE TAB ===== */}
              {activeTab === 'profile' && (
                <div className="space-y-6">
                  <div className="flex items-center gap-6 pb-6 border-b border-white/5">
                    <div className="w-20 h-20 rounded-full border-4 border-primary/20 overflow-hidden">
                      <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Alex" alt="Avatar" />
                    </div>
                    <div>
                      <p className="text-white font-bold">{profile.name}</p>
                      <p className="text-sm text-slate-400">{profile.email}</p>
                      <button className="mt-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white text-xs font-medium transition-all">
                        Change Avatar
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[
                      { label: 'Full Name', key: 'name', type: 'text' },
                      { label: 'Email Address', key: 'email', type: 'email' },
                      { label: 'Company', key: 'company', type: 'text' },
                    ].map(field => (
                      <div key={field.key} className="space-y-2">
                        <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">{field.label}</label>
                        <input
                          type={field.type}
                          value={profile[field.key]}
                          onChange={(e) => setProfile({ ...profile, [field.key]: e.target.value })}
                          className="w-full bg-slate-900 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary/50 transition-colors"
                        />
                      </div>
                    ))}
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Role</label>
                      <input
                        type="text"
                        value={profile.role}
                        disabled
                        className="w-full bg-slate-900/50 border border-white/5 rounded-lg px-4 py-2.5 text-slate-500 cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div className="pt-6 border-t border-white/5 flex justify-end">
                    <button
                      onClick={handleSave}
                      disabled={loading}
                      className="px-6 py-2.5 rounded-lg bg-primary text-white font-medium hover:bg-primary-hover shadow-lg shadow-primary/20 transition-all flex items-center gap-2"
                    >
                      {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                      Save Changes
                    </button>
                  </div>
                </div>
              )}

              {/* ===== WORKSPACE TAB ===== */}
              {activeTab === 'workspace' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-white mb-1">Switch Workspace</h3>
                    <p className="text-sm text-slate-400 mb-6">
                      Select the company workspace you want to operate in. All modules (Dashboard, Leads, Pipeline) will reflect this company's context.
                    </p>

                    <div className="space-y-3">
                      {companies.map((c) => (
                        <motion.button
                          key={c.id}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          onClick={() => handleSwitchCompany(c)}
                          className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all text-left ${
                            company?.id === c.id
                              ? 'border-primary/40 bg-primary/10'
                              : 'border-white/5 bg-white/[0.02] hover:bg-white/5'
                          }`}
                        >
                          <div
                            className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 border border-white/10"
                            style={{ boxShadow: `0 0 16px ${c.primaryColor || '#6366f1'}30` }}
                          >
                            <img src={c.logoUrl} alt={c.name} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1">
                            <p className="text-white font-semibold">{c.name}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-xs text-slate-500">{c.industry}</span>
                              <span className="text-slate-700">·</span>
                              <span
                                className="text-xs font-bold uppercase tracking-wider"
                                style={{ color: c.primaryColor || '#6366f1' }}
                              >
                                {c.plan}
                              </span>
                            </div>
                          </div>
                          {company?.id === c.id ? (
                            <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                              <Check size={14} className="text-white" />
                            </div>
                          ) : (
                            <div className="w-6 h-6 rounded-full border border-white/10 flex-shrink-0" />
                          )}
                        </motion.button>
                      ))}

                      {companies.length === 0 && (
                        <div className="py-12 text-center text-slate-500">
                          <Building2 size={40} className="mx-auto mb-3 opacity-20" />
                          <p>No companies found. Make sure the backend is running.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* ===== OTHER TABS ===== */}
              {activeTab !== 'profile' && activeTab !== 'workspace' && (
                <div className="h-64 flex flex-col items-center justify-center text-slate-500 space-y-4">
                  <Paintbrush size={48} className="opacity-20" />
                  <p>This section is under construction.</p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Settings;
