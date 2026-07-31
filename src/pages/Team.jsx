import React, { useState, useEffect } from 'react';
import { 
  Users, 
  ShieldAlert, 
  UserPlus, 
  Trash2, 
  Check, 
  AlertCircle, 
  ToggleLeft, 
  ToggleRight, 
  Mail, 
  User, 
  Shield, 
  Sparkles,
  Search,
  UserCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store';

const RoleBadge = ({ role }) => {
  const styles = {
    'ADMIN': 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    'SALES_MANAGER': 'bg-sky-500/10 text-sky-400 border-sky-500/20',
    'MARKETING_MANAGER': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    'MANAGER': 'bg-violet-500/10 text-violet-400 border-violet-500/20',
    'EMPLOYEE': 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  };

  const displayName = role ? role.replace('_', ' ') : 'MEMBER';

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider border ${styles[role] || styles['EMPLOYEE']}`}>
      {displayName}
    </span>
  );
};

export default function Team() {
  const { user, users, fetchUsers, createTeamUser, toggleUserActive, deleteTeamUser } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Form State
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'SALES_MANAGER'
  });
  
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      fetchUsers();
    }
  }, [user]);

  // Deny access if not Admin
  if (user?.role !== 'ADMIN') {
    return (
      <div className="p-8 min-h-[calc(100vh-5rem)] flex items-center justify-center bg-surface">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full text-center p-8 glass-card border border-white/5 rounded-3xl"
        >
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-rose-500/10 flex items-center justify-center border border-rose-500/20">
            <ShieldAlert className="text-rose-400" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
          <p className="text-slate-400 text-sm mb-6">
            Only enterprise Administrators can access the Team Management workspace and generate employee credentials.
          </p>
        </motion.div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!formData.username || !formData.email || !formData.password || !formData.role) {
      setError("Please fill out all credential fields.");
      return;
    }

    try {
      setIsAdding(true);
      await createTeamUser(formData);
      setSuccess(`Account credentials successfully created for @${formData.username}!`);
      setFormData({
        username: '',
        email: '',
        password: '',
        role: 'SALES_MANAGER'
      });
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create team member credentials.");
    } finally {
      setIsAdding(false);
    }
  };

  const handleToggleActive = async (id, memberUsername) => {
    try {
      await toggleUserActive(id);
    } catch (err) {
      setError(`Could not change status of @${memberUsername}`);
    }
  };

  const handleDelete = async (id, memberUsername) => {
    if (window.confirm(`Are you sure you want to revoke credentials and delete @${memberUsername}?`)) {
      try {
        await deleteTeamUser(id);
        setSuccess(`Successfully deleted @${memberUsername}`);
      } catch (err) {
        setError(`Failed to delete @${memberUsername}`);
      }
    }
  };

  // Stats aggregation
  const salesManagersCount = users.filter(u => u.role === 'SALES_MANAGER').length;
  const marketingManagersCount = users.filter(u => u.role === 'MARKETING_MANAGER').length;
  const totalCount = users.length;
  const activeCount = users.filter(u => u.active !== false).length;

  const filteredUsers = users.filter(u => 
    u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 space-y-8 bg-surface min-h-[calc(100vh-5rem)]">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest mb-1.5">
            <Sparkles size={14} /> Admin Directory Control
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Team Management</h1>
          <p className="text-slate-400 text-xs mt-1">
            Create custom accounts, assign roles, manage active/inactive statuses, and oversee team capacity.
          </p>
        </div>
      </div>

      {/* Grid of aggregated stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div 
          whileHover={{ y: -4 }}
          className="p-5 glass-card border border-white/5 rounded-2xl flex items-center justify-between"
        >
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Total Members</span>
            <h3 className="text-2xl font-black text-white mt-1">{totalCount}</h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <Users size={20} />
          </div>
        </motion.div>

        <motion.div 
          whileHover={{ y: -4 }}
          className="p-5 glass-card border border-white/5 rounded-2xl flex items-center justify-between"
        >
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Sales Managers</span>
            <h3 className="text-2xl font-black text-sky-400 mt-1">{salesManagersCount}</h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-sky-500/10 flex items-center justify-center text-sky-400">
            <Shield size={20} />
          </div>
        </motion.div>

        <motion.div 
          whileHover={{ y: -4 }}
          className="p-5 glass-card border border-white/5 rounded-2xl flex items-center justify-between"
        >
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Marketing Managers</span>
            <h3 className="text-2xl font-black text-emerald-400 mt-1">{marketingManagersCount}</h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
            <UserCheck size={20} />
          </div>
        </motion.div>

        <motion.div 
          whileHover={{ y: -4 }}
          className="p-5 glass-card border border-white/5 rounded-2xl flex items-center justify-between"
        >
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Active Users</span>
            <h3 className="text-2xl font-black text-indigo-400 mt-1">{activeCount}</h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
            <UserCheck size={20} />
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left Side: Create Member Credentials Form */}
        <div className="lg:col-span-1 glass-card border border-white/5 p-6 rounded-2xl space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <UserPlus size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Issue Team Credentials</h2>
              <p className="text-[11px] text-slate-500">Create new logins directly</p>
            </div>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: -10 }} 
                className="flex items-start gap-2.5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs"
              >
                <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}

            {success && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: -10 }} 
                className="flex items-start gap-2.5 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs"
              >
                <Check size={16} className="mt-0.5 flex-shrink-0" />
                <span>{success}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">Username</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                <input
                  type="text"
                  placeholder="e.g. sarah_sales"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase().replace(/\s+/g, '') })}
                  className="w-full bg-slate-900/50 border border-white/5 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-slate-600 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                <input
                  type="email"
                  placeholder="e.g. sarah@company.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-slate-900/50 border border-white/5 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-slate-600 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">Temporary Password</label>
              <input
                type="password"
                placeholder="••••••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full bg-slate-900/50 border border-white/5 rounded-xl py-2.5 px-4 text-xs text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-slate-600 font-medium"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">Operational Role</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full bg-slate-900/50 border border-white/5 rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium"
              >
                <option value="SALES_MANAGER">Sales Manager</option>
                <option value="MARKETING_MANAGER">Marketing Manager</option>
                <option value="MANAGER">General Manager</option>
                <option value="EMPLOYEE">Standard Executive</option>
              </select>
            </div>

            <motion.button
              whileTap={{ scale: 0.98 }}
              disabled={isAdding}
              type="submit"
              className="w-full py-3 bg-primary text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all disabled:opacity-50"
            >
              {isAdding ? "Generating Account..." : "Create Account & Grant Access"}
            </motion.button>
          </form>
        </div>

        {/* Right Side: Interactive Table of Team Roster */}
        <div className="lg:col-span-2 glass-card border border-white/5 p-6 rounded-2xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-white">Active Operational Roster</h2>
              <p className="text-[11px] text-slate-500">Live directory of accounts assigned to your workspace.</p>
            </div>
            
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" size={14} />
              <input
                type="text"
                placeholder="Search by name, role or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-900/50 border border-white/5 rounded-full py-1.5 pl-9 pr-4 text-xs text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-slate-600"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-[10px] font-bold uppercase tracking-widest text-slate-500 text-left">
                  <th className="pb-3 pr-4">Team Member</th>
                  <th className="pb-3 px-4">Role</th>
                  <th className="pb-3 px-4">Status</th>
                  <th className="pb-3 pl-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                <AnimatePresence>
                  {filteredUsers.map((member) => (
                    <motion.tr 
                      key={member.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="group hover:bg-white/[0.01] transition-colors"
                    >
                      <td className="py-4 pr-4">
                        <div className="flex items-center gap-3">
                          <img 
                            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${member.username}`} 
                            alt={member.username} 
                            className="w-8 h-8 rounded-full border border-white/10 bg-slate-950 flex-shrink-0"
                          />
                          <div>
                            <p className="text-xs font-bold text-white">@{member.username}</p>
                            <p className="text-[10px] text-slate-500 font-medium">{member.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <RoleBadge role={member.role} />
                      </td>
                      <td className="py-4 px-4">
                        {member.role === 'ADMIN' ? (
                          <span className="text-[10px] text-emerald-500 font-semibold flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" /> System Admin
                          </span>
                        ) : (
                          <button
                            onClick={() => handleToggleActive(member.id, member.username)}
                            className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-400 hover:text-white transition-colors"
                          >
                            {member.active !== false ? (
                              <>
                                <ToggleRight size={18} className="text-primary" /> Active
                              </>
                            ) : (
                              <>
                                <ToggleLeft size={18} className="text-slate-600" /> Suspended
                              </>
                            )}
                          </button>
                        )}
                      </td>
                      <td className="py-4 pl-4 text-right">
                        {member.role !== 'ADMIN' && (
                          <button
                            onClick={() => handleDelete(member.id, member.username)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all opacity-0 group-hover:opacity-100"
                            title="Revoke and delete credentials"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan="4" className="text-center py-8 text-slate-500 text-xs">
                      No matching team members found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
}
