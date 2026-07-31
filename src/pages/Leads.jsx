import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Filter, 
  Plus, 
  MoreHorizontal, 
  Mail, 
  Phone, 
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Loader2,
  X,
  Brain,
  Target,
  Calendar,
  MessageSquare,
  ClipboardList,
  CheckCircle,
  HelpCircle,
  FileText,
  Edit,
  ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { leadService, aiService } from '../api';
import { useStore } from '../store';

const StatusBadge = ({ status }) => {
  const styles = {
    'New Lead': 'bg-sky-500/10 text-sky-400 border-sky-500/20',
    'Contacted': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    'Interested': 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    'Negotiation': 'bg-violet-500/10 text-violet-400 border-violet-500/20',
    'Won': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    'Lost': 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  };

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status] || styles['New Lead']}`}>
      {status}
    </span>
  );
};

const PriorityBadge = ({ priority }) => {
  const styles = {
    'High': 'text-rose-400',
    'Medium': 'text-amber-400',
    'Low': 'text-emerald-400',
  };

  return (
    <div className="flex items-center gap-1.5">
      <div className={`w-1.5 h-1.5 rounded-full ${styles[priority] === 'text-rose-400' ? 'bg-rose-400' : styles[priority] === 'text-amber-400' ? 'bg-amber-400' : 'bg-emerald-400'}`} />
      <span className={`text-xs font-medium ${styles[priority]}`}>{priority}</span>
    </div>
  );
};

const AddLeadModal = ({ isOpen, onClose, onAdd, teamUsers = [] }) => {
  const defaultAssignee = teamUsers.length > 0 ? teamUsers[0].username : 'Unassigned';
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    source: 'Direct',
    status: 'New Lead',
    priority: 'Medium',
    notes: '',
    assignedTo: defaultAssignee
  });

  // When team users load in, sync default assignee
  useEffect(() => {
    if (teamUsers.length > 0 && formData.assignedTo === 'Unassigned') {
      setFormData(f => ({ ...f, assignedTo: teamUsers[0].username }));
    }
  }, [teamUsers]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Set baseline values
      const postData = {
        ...formData,
        conversionProbability: formData.priority === 'High' ? 80 : formData.priority === 'Medium' ? 50 : 25,
        nextBestAction: 'Log introductory discovery call'
      };
      await leadService.create(postData);
      onAdd();
      onClose();
      const resetAssignee = teamUsers.length > 0 ? teamUsers[0].username : 'Unassigned';
      setFormData({ name: '', email: '', phone: '', source: 'Direct', status: 'New Lead', priority: 'Medium', notes: '', assignedTo: resetAssignee });
    } catch (error) {
      console.error("Error creating lead:", error);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[100]" />
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md glass-card p-6 z-[101]">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Add New Lead</h2>
              <button onClick={onClose} className="text-slate-500 hover:text-white"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input type="text" placeholder="Name" className="w-full bg-slate-900 border border-white/5 rounded-xl p-3 text-white focus:outline-none" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              <input type="email" placeholder="Email" className="w-full bg-slate-900 border border-white/5 rounded-xl p-3 text-white focus:outline-none" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              <input type="text" placeholder="Phone" className="w-full bg-slate-900 border border-white/5 rounded-xl p-3 text-white focus:outline-none" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
              <div className="grid grid-cols-2 gap-4">
                <select className="bg-slate-900 border border-white/5 rounded-xl p-3 text-white text-sm outline-none" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                  <option>New Lead</option>
                  <option>Contacted</option>
                  <option>Interested</option>
                  <option>Won</option>
                </select>
                <select className="bg-slate-900 border border-white/5 rounded-xl p-3 text-white text-sm outline-none" value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value})}>
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                </select>
              </div>
              <div className="relative">
                <select
                  value={formData.assignedTo}
                  onChange={e => setFormData({...formData, assignedTo: e.target.value})}
                  className="w-full bg-slate-900 border border-white/5 rounded-xl p-3 text-white focus:outline-none focus:ring-1 focus:ring-primary/50 appearance-none"
                >
                  {teamUsers.length === 0 && <option value="Unassigned">Unassigned</option>}
                  {teamUsers.filter(u => u.active !== false).map(u => (
                    <option key={u.id} value={u.username}>{u.username} ({u.role.replace('_', ' ')})</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={14} />
              </div>
              <textarea placeholder="Notes" className="w-full h-24 bg-slate-900 border border-white/5 rounded-xl p-3 text-white focus:outline-none resize-none" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} />
              <button type="submit" className="w-full bg-primary py-3 rounded-xl font-bold text-white shadow-lg shadow-primary/20 hover:bg-primary-hover transition-all">Create Lead</button>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// --- HUBSPOT-STYLE INTERACTIVE DETAIL DRAWER ---
const LeadDetailDrawer = ({ lead, isOpen, onClose, onUpdate, defaultEdit = false, teamUsers = [] }) => {
  const [activities, setActivities] = useState([]);
  const [loadingAct, setLoadingAct] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  
  // Quick Activity log states
  const [actType, setActType] = useState('Call');
  const [actSummary, setActSummary] = useState('');
  const [isSavingAct, setIsSavingAct] = useState(false);

  // Profile Edit states
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: '',
    notes: '',
    assignedTo: ''
  });

  const drawerRef = useRef(null);

  useEffect(() => {
    if (lead) {
      setEditForm({
        name: lead.name || '',
        email: lead.email || '',
        phone: lead.phone || '',
        notes: lead.notes || '',
        assignedTo: lead.assignedTo || ''
      });
      setIsEditing(defaultEdit);
    }
  }, [lead, defaultEdit]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (drawerRef.current && !drawerRef.current.contains(event.target)) {
        onClose();
      }
    };
    if (isOpen) {
      const timer = setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside);
      }, 100);
      return () => {
        clearTimeout(timer);
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isOpen, onClose]);

  useEffect(() => {
    if (lead && isOpen) {
      loadTimeline();
      loadAiScore();
    }
  }, [lead, isOpen]);

  const loadTimeline = async () => {
    setLoadingAct(true);
    try {
      const res = await leadService.getActivities(lead.id);
      setActivities(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingAct(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      const updated = {
        ...lead,
        name: editForm.name,
        email: editForm.email,
        phone: editForm.phone,
        notes: editForm.notes,
        assignedTo: editForm.assignedTo
      };
      await leadService.update(lead.id, updated);
      setIsEditing(false);
      onUpdate();
      
      // Log an activity entry automatically
      await leadService.logActivity(lead.id, {
        type: 'Status Change',
        summary: 'Lead contact information was updated.'
      });
      loadTimeline();
    } catch (err) {
      console.error(err);
      alert("Failed to save changes.");
    }
  };

  const loadAiScore = async () => {
    try {
      const res = await aiService.scoreLead(lead);
      setAiAnalysis(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleLogActivity = async (e) => {
    e.preventDefault();
    if (!actSummary.trim() || isSavingAct) return;
    setIsSavingAct(true);

    try {
      await leadService.logActivity(lead.id, {
        type: actType,
        summary: actSummary,
      });
      setActSummary('');
      // Refresh local timeline
      await loadTimeline();
    } catch (err) {
      console.error(err);
      alert("Failed to log activity.");
    } finally {
      setIsSavingAct(false);
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    try {
      const updated = { ...lead, status: newStatus };
      await leadService.update(lead.id, updated);
      onUpdate();
      loadTimeline();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && lead && (
        <motion.div 
          ref={drawerRef}
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 220 }}
          className="fixed right-0 top-0 bottom-0 w-full max-w-lg glass-dark border-l border-white/10 shadow-2xl p-6 z-[81] flex flex-col justify-between overflow-y-auto custom-scrollbar"
        >
            <div>
              {/* Header */}
              <div className="flex items-center justify-between pb-6 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary">
                    {lead.name?.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white leading-tight">{lead.name}</h2>
                    <p className="text-xs text-slate-400 mt-0.5">{lead.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setIsEditing(!isEditing)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                      isEditing
                        ? 'bg-rose-500/10 border-rose-500/20 text-rose-400 hover:bg-rose-500/20'
                        : 'bg-primary/10 border-primary/20 text-primary hover:bg-primary/20'
                    }`}
                  >
                    {isEditing ? 'Cancel' : 'Edit Info'}
                  </button>
                  <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/5 text-slate-500 hover:text-white transition-all">
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* CRM Quick Stage Transitions */}
              <div className="py-4 border-b border-white/5">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Stage Pipeline Progress</p>
                <div className="flex flex-wrap gap-1.5">
                  {['New Lead', 'Contacted', 'Interested', 'Negotiation', 'Won'].map((stage) => (
                    <button
                      key={stage}
                      onClick={() => handleUpdateStatus(stage)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                        lead.status === stage
                          ? 'bg-primary/20 text-primary border-primary/40 shadow-inner'
                          : 'border-white/5 bg-white/[0.01] text-slate-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      {stage}
                    </button>
                  ))}
                </div>
              </div>

              {/* AI Einstein Insights */}
              <div className="py-5 border-b border-white/5 space-y-4">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                  <Brain size={14} className="text-primary animate-pulse" />
                  Flow Einstein AI Insights
                </h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-white/[0.01] border border-white/5 flex flex-col justify-center relative">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Conversion Prob.</p>
                    <h4 className={`text-xl font-bold mt-1 ${lead.conversionProbability > 70 ? 'text-emerald-400' : lead.conversionProbability > 40 ? 'text-amber-400' : 'text-rose-400'}`}>
                      {lead.conversionProbability || 50}%
                    </h4>
                    <div className="w-full h-1 bg-slate-800 rounded-full mt-2 overflow-hidden">
                      <div className={`h-full ${lead.conversionProbability > 70 ? 'bg-emerald-400' : lead.conversionProbability > 40 ? 'bg-amber-400' : 'bg-rose-400'}`} style={{ width: `${lead.conversionProbability}%` }} />
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-white/[0.01] border border-white/5 flex flex-col justify-center">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Sentiment Score</p>
                    <h4 className="text-xl font-bold mt-1 text-white flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${lead.sentiment === 'Positive' ? 'bg-emerald-400' : lead.sentiment === 'Negative' ? 'bg-rose-400' : 'bg-amber-400'}`} />
                      {lead.sentiment || 'Neutral'}
                    </h4>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 space-y-2">
                  <p className="text-[9px] font-bold text-primary uppercase tracking-wider flex items-center gap-1">
                    <Target size={12} />
                    Next Best Action
                  </p>
                  <p className="text-xs text-slate-300 font-medium leading-relaxed">
                    {lead.nextBestAction || "Schedule a quick email/phone follow-up to check priority."}
                  </p>
                </div>
              </div>

              {/* Lead Information (Editable form vs View) */}
              <div className="py-5 border-b border-white/5 space-y-3">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                  Lead Information
                </h3>
                
                {isEditing ? (
                  <form onSubmit={handleSaveProfile} className="space-y-4 bg-slate-950/20 p-4 rounded-xl border border-white/5">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Full Name</label>
                      <input 
                        type="text" 
                        required 
                        value={editForm.name} 
                        onChange={e => setEditForm({...editForm, name: e.target.value})}
                        className="w-full bg-slate-900 border border-white/5 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-primary/50" 
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Email Address</label>
                        <input 
                          type="email" 
                          required 
                          value={editForm.email} 
                          onChange={e => setEditForm({...editForm, email: e.target.value})}
                          className="w-full bg-slate-900 border border-white/5 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-primary/50" 
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Phone Number</label>
                        <input 
                          type="text" 
                          value={editForm.phone} 
                          onChange={e => setEditForm({...editForm, phone: e.target.value})}
                          className="w-full bg-slate-900 border border-white/5 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-primary/50" 
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Assigned To</label>
                      <div className="relative">
                        <select
                          value={editForm.assignedTo}
                          onChange={e => setEditForm({...editForm, assignedTo: e.target.value})}
                          className="w-full bg-slate-900 border border-white/5 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-primary/50 appearance-none"
                        >
                          {teamUsers.length === 0 && <option value={editForm.assignedTo}>{editForm.assignedTo || 'Unassigned'}</option>}
                          {teamUsers.filter(u => u.active !== false).map(u => (
                            <option key={u.id} value={u.username}>{u.username} ({u.role.replace('_', ' ')})</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={12} />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Client Notes / Description</label>
                      <textarea 
                        value={editForm.notes} 
                        onChange={e => setEditForm({...editForm, notes: e.target.value})}
                        className="w-full h-20 bg-slate-900 border border-white/5 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-primary/50 resize-none" 
                      />
                    </div>

                    <button 
                      type="submit" 
                      className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-lg transition-all shadow-md shadow-emerald-500/10"
                    >
                      Save Lead Changes
                    </button>
                  </form>
                ) : (
                  <div className="p-4 rounded-xl bg-white/[0.01] border border-white/5 space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Phone Number</p>
                        <p className="text-xs text-white font-medium mt-1">{lead.phone || 'No phone number'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Lead Source</p>
                        <p className="text-xs text-white font-medium mt-1">{lead.source || 'Direct'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Assigned To</p>
                        <p className="text-xs text-white font-medium mt-1 flex items-center gap-1.5">
                          <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${lead.assignedTo || 'Unassigned'}`} alt="Assignee Avatar" className="w-4 h-4 rounded-full" />
                          {lead.assignedTo || 'Unassigned'}
                        </p>
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Description & Notes</p>
                      <p className="text-xs text-slate-300 leading-relaxed mt-1 whitespace-pre-line">{lead.notes || 'No description notes.'}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Activity Timeline */}
              <div className="py-5 space-y-4">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                  <ClipboardList size={14} className="text-primary" />
                  Interaction Timeline
                </h3>

                {loadingAct ? (
                  <div className="flex items-center justify-center py-6">
                    <Loader2 size={20} className="animate-spin text-primary" />
                  </div>
                ) : activities.length > 0 ? (
                  <div className="space-y-4 relative before:absolute before:left-4 before:top-2 before:bottom-2 before:w-px before:bg-white/5">
                    {activities.map((act, i) => {
                      const icons = {
                        'Call': <Phone size={12} className="text-emerald-400" />,
                        'Email': <Mail size={12} className="text-sky-400" />,
                        'Meeting': <Calendar size={12} className="text-violet-400" />,
                        'Status Change': <MessageSquare size={12} className="text-slate-400" />
                      };

                      const colors = {
                        'Call': 'bg-emerald-500/10 border-emerald-500/20',
                        'Email': 'bg-sky-500/10 border-sky-500/20',
                        'Meeting': 'bg-violet-500/10 border-violet-500/20',
                        'Status Change': 'bg-slate-500/10 border-slate-500/20'
                      };

                      return (
                        <div key={act.id || i} className="flex gap-4 relative pl-8">
                          <div className={`absolute left-0 w-8 h-8 rounded-lg flex items-center justify-center border ${colors[act.type] || colors['Status Change']}`}>
                            {icons[act.type] || <FileText size={12} className="text-slate-400" />}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-semibold text-white">{act.type}</span>
                              <span className="text-[10px] text-slate-500">
                                {new Date(act.createdAt).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <p className="text-xs text-slate-400 mt-1 leading-relaxed">{act.summary}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-center text-xs text-slate-600 py-4">No activities logged yet.</p>
                )}
              </div>
            </div>

            {/* Quick Activity Logger Form */}
            <form onSubmit={handleLogActivity} className="p-4 rounded-xl border border-white/5 bg-slate-950/40 space-y-3 mt-6">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Quick Log Interaction</p>
              
              <div className="flex gap-2">
                {['Call', 'Email', 'Meeting'].map(type => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setActType(type)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                      actType === type
                        ? 'bg-primary/10 text-primary border-primary/20'
                        : 'border-white/5 bg-white/[0.01] text-slate-500 hover:text-white'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>

              <textarea
                value={actSummary}
                onChange={e => setActSummary(e.target.value)}
                placeholder={`Summarize the ${actType.toLowerCase()} notes...`}
                className="w-full h-16 bg-slate-900 border border-white/5 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-primary/50 resize-none placeholder:text-slate-600"
              />

              <button
                type="submit"
                disabled={isSavingAct || !actSummary.trim()}
                className="w-full py-2 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary-hover disabled:opacity-50 transition-all flex items-center justify-center gap-1.5"
              >
                {isSavingAct ? <Loader2 size={12} className="animate-spin" /> : 'Log Activity'}
              </button>
            </form>
          </motion.div>
      )}
    </AnimatePresence>
  );
};

const Leads = () => {
  const { users, fetchUsers } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Detail Drawer state
  const [selectedLead, setSelectedLead] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [defaultEditMode, setDefaultEditMode] = useState(false);

  useEffect(() => {
    fetchLeads();
    fetchUsers(); // Load team members for Assigned To dropdown
  }, []);

  const fetchLeads = async () => {
    try {
      const response = await leadService.getAll();
      setLeads(response.data);
      // If a lead is currently selected, refresh its details to keep state in sync
      if (selectedLead) {
        const fresh = response.data.find(l => l.id === selectedLead.id);
        if (fresh) setSelectedLead(fresh);
      }
    } catch (error) {
      console.error("Error fetching leads:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenLead = (lead, editImmediately = false) => {
    setSelectedLead(lead);
    setDefaultEditMode(editImmediately);
    setIsDrawerOpen(true);
  };

  const filteredLeads = leads.filter(lead => 
    lead.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 space-y-6 w-full">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Leads Management</h1>
          <p className="text-slate-500 text-sm">Track and manage your potential customers.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl glass border-white/5 text-sm font-medium text-slate-300 hover:text-white transition-all flex items-center justify-center gap-2">
            <Sparkles size={16} className="text-primary" />
            AI Import
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary-hover shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2"
          >
            <Plus size={18} />
            Add Lead
          </button>
        </div>
      </header>

      <div className="glass-card overflow-hidden min-h-[400px] flex flex-col">
        <div className="p-4 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/[0.02]">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              type="text" 
              placeholder="Search leads..."
              className="w-full bg-slate-900/50 border border-white/5 rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all text-white placeholder:text-slate-600"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-lg hover:bg-white/5 text-slate-400 transition-colors">
              <Filter size={18} />
            </button>
            <div className="h-6 w-px bg-white/5 mx-2" />
            <span className="text-sm text-slate-500">Showing {filteredLeads.length} leads</span>
          </div>
        </div>

        <div className="overflow-x-auto flex-1">
          {loading ? (
            <div className="h-64 flex items-center justify-center">
              <Loader2 className="text-primary animate-spin" size={32} />
            </div>
          ) : (
             <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/[0.01]">
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Lead</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Assigned To</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">AI Score</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Next Best Action</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredLeads.map((lead, idx) => (
                  <motion.tr 
                    key={lead.id || idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="hover:bg-white/[0.02] transition-colors group cursor-pointer"
                    onClick={() => handleOpenLead(lead)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center border border-white/5 text-sm font-medium text-primary">
                          {lead.name?.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-white group-hover:text-primary transition-colors flex items-center gap-1">
                            {lead.name}
                            <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                          <div className="text-xs text-slate-500 mt-0.5">{lead.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={lead.status} />
                      <div className="mt-2">
                        <PriorityBadge priority={lead.priority} />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-850 border border-white/5 overflow-hidden flex items-center justify-center">
                          <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${lead.assignedTo || 'Unassigned'}`} alt="Assignee Avatar" className="w-full h-full object-cover" />
                        </div>
                        <span className="text-xs font-semibold text-slate-300">
                          {lead.assignedTo || 'Unassigned'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Brain size={14} className={lead.conversionProbability > 70 ? 'text-emerald-400' : lead.conversionProbability > 40 ? 'text-amber-400' : 'text-rose-400'} />
                        <span className={`text-sm font-bold ${lead.conversionProbability > 70 ? 'text-emerald-400' : lead.conversionProbability > 40 ? 'text-amber-400' : 'text-rose-400'}`}>
                          {lead.conversionProbability || 50}%
                        </span>
                      </div>
                      <div className="w-24 h-1.5 bg-slate-800 rounded-full mt-1.5 overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${lead.conversionProbability > 70 ? 'bg-emerald-400' : lead.conversionProbability > 40 ? 'bg-amber-400' : 'bg-rose-400'}`} 
                          style={{ width: `${lead.conversionProbability || 50}%` }}
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-start gap-2 max-w-[200px]">
                        <Target size={14} className="text-primary mt-0.5 shrink-0" />
                        <span className="text-xs text-slate-300 leading-relaxed">
                          {lead.nextBestAction || 'Engage via email to gauge interest'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleOpenLead(lead, true)}
                          className="p-2 rounded-lg hover:bg-primary/10 text-slate-400 hover:text-primary transition-all"
                          title="Edit Lead Info"
                        >
                          <Edit size={16} />
                        </button>
                        <button className="p-2 rounded-lg hover:bg-sky-500/10 text-slate-400 hover:text-sky-400 transition-all">
                          <Mail size={16} />
                        </button>
                        <button className="p-2 rounded-lg hover:bg-emerald-500/10 text-slate-400 hover:text-emerald-400 transition-all">
                          <Phone size={16} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="p-4 border-t border-white/5 flex items-center justify-between bg-white/[0.01]">
          <span className="text-sm text-slate-500">Page 1 of 1</span>
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-lg border border-white/5 text-slate-500 hover:text-white hover:bg-white/5 transition-all disabled:opacity-50" disabled>
              <ChevronLeft size={18} />
            </button>
            <button className="p-2 rounded-lg border border-white/5 text-slate-500 hover:text-white hover:bg-white/5 transition-all disabled:opacity-50" disabled>
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      <AddLeadModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onAdd={fetchLeads} teamUsers={users} />
      
      {/* Dynamic Slide-out Detail Drawer */}
      <LeadDetailDrawer 
        lead={selectedLead} 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
        onUpdate={fetchLeads}
        defaultEdit={defaultEditMode}
        teamUsers={users}
      />
    </div>
  );
};

export default Leads;
