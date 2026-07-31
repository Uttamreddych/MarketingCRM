import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Mail, Lock, User, ArrowRight, Building2, Zap, ShieldCheck, TrendingUp } from 'lucide-react';
import { useStore } from '../store';
import { useNavigate } from 'react-router-dom';
import { companyService } from '../api';

// --------------- Floating Company Orb ---------------
const FloatingCompanyOrb = ({ company, style, animDelay }) => (
  <motion.div
    style={style}
    initial={{ opacity: 0, scale: 0 }}
    animate={{
      opacity: [0, 1, 0.8, 1],
      scale: [0.8, 1, 0.95, 1],
      y: [0, -18, 8, 0],
    }}
    transition={{
      duration: 6,
      delay: animDelay,
      repeat: Infinity,
      repeatType: 'mirror',
      ease: 'easeInOut',
    }}
    className="absolute flex items-center gap-2 px-3 py-2 rounded-2xl backdrop-blur-md border border-white/20 shadow-2xl cursor-default"
    whileHover={{ scale: 1.12, zIndex: 50 }}
  >
    <img
      src={company.logoUrl}
      alt={company.name}
      className="w-7 h-7 rounded-lg"
      onError={(e) => { e.target.style.display = 'none'; }}
    />
    <div>
      <p className="text-white text-xs font-bold leading-none">{company.name}</p>
      <p className="text-white/50 text-[9px] leading-none mt-0.5">{company.industry}</p>
    </div>
    <span
      className="ml-1 w-1.5 h-1.5 rounded-full animate-pulse"
      style={{ backgroundColor: company.primaryColor || '#6366f1' }}
    />
  </motion.div>
);

// Static positions for orbs
const ORB_POSITIONS = [
  { top: '8%',  left: '5%' },
  { top: '18%', left: '55%' },
  { top: '35%', left: '10%' },
  { top: '28%', right: '5%' },
  { top: '55%', left: '40%' },
  { top: '65%', left: '3%'  },
  { top: '70%', right: '8%' },
  { top: '82%', left: '45%' },
  { top: '90%', left: '12%' },
  { top: '48%', right: '2%' },
];

const CompanyTicker = ({ companies }) => {
  const doubled = [...companies, ...companies];
  return (
    <div className="overflow-hidden w-full py-2 mb-6">
      <motion.div
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration: 20, ease: 'linear', repeat: Infinity }}
        className="flex gap-4 w-max"
      >
        {doubled.map((c, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/60 text-xs font-medium whitespace-nowrap"
          >
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: c.primaryColor || '#6366f1' }}
            />
            {c.name}
          </span>
        ))}
      </motion.div>
    </div>
  );
};

const AnimatedStat = ({ value, label, color }) => (
  <div className="text-center">
    <motion.p
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 200, delay: 0.6 }}
      className="text-2xl font-extrabold"
      style={{ color }}
    >
      {value}
    </motion.p>
    <p className="text-slate-500 text-xs mt-0.5">{label}</p>
  </div>
);

const Auth = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  
  // Input fields
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('Acme Corp');
  const [companies, setCompanies] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');

  const { login, register, authLoading, authError } = useStore();

  useEffect(() => {
    // Seed default workspace names from backend
    companyService.getAll()
      .then(res => setCompanies(res.data))
      .catch(() => {
        const demo = [
          { name: 'Acme Corp', industry: 'Retail', primaryColor: '#6366f1', logoUrl: 'https://api.dicebear.com/7.x/initials/svg?seed=Acme&backgroundColor=6366f1' },
          { name: 'Nova Tech', industry: 'SaaS', primaryColor: '#ec4899', logoUrl: 'https://api.dicebear.com/7.x/initials/svg?seed=Nova&backgroundColor=ec4899' },
          { name: 'GreenLeaf', industry: 'Healthcare', primaryColor: '#10b981', logoUrl: 'https://api.dicebear.com/7.x/initials/svg?seed=Green&backgroundColor=10b981' }
        ];
        setCompanies(demo);
      });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (isLogin) {
      // Login flow: use username and password
      const userVal = username || email.split('@')[0];
      const success = await login(userVal, password);
      if (success) {
        navigate('/');
      } else {
        setErrorMsg(authError || 'Invalid credentials');
      }
    } else {
      // Register flow
      if (!companyName.trim()) {
        setErrorMsg('Company name is required');
        return;
      }
      const userVal = username || email.split('@')[0];
      const success = await register(userVal, email, password, companyName);
      if (success) {
        setIsLogin(true);
        setErrorMsg('Workspace created! Please log in below.');
      } else {
        setErrorMsg(authError || 'Registration failed');
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#080c17] flex w-full relative overflow-hidden">
      {/* ========== LEFT PANEL — Animated Brand World ========== */}
      <div className="hidden lg:flex lg:w-[55%] relative items-center justify-center overflow-hidden select-none">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-[10%] left-[20%] w-96 h-96 bg-indigo-600/20 rounded-full blur-[130px] animate-pulse" />
          <div className="absolute bottom-[5%] right-[10%] w-80 h-80 bg-violet-600/20 rounded-full blur-[120px]" />
          <div className="absolute top-[60%] left-[5%] w-64 h-64 bg-pink-600/15 rounded-full blur-[100px]" />
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: 'radial-gradient(rgba(255,255,255,0.15) 1px, transparent 1px)',
              backgroundSize: '30px 30px',
            }}
          />
        </div>

        {companies.map((company, i) => (
          <FloatingCompanyOrb
            key={company.name}
            company={company}
            style={{
              ...ORB_POSITIONS[i % ORB_POSITIONS.length],
              background: `linear-gradient(135deg, ${company.primaryColor}30 0%, rgba(0,0,0,0.6) 100%)`,
            }}
            animDelay={i * 0.6}
          />
        ))}

        <div className="relative z-10 text-center px-12 max-w-lg">
          <div>
            <div className="flex items-center justify-center mb-6">
              <div className="relative">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-2xl shadow-indigo-500/40">
                  <Sparkles className="text-white" size={40} />
                </div>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                  className="absolute -inset-2 rounded-[28px] border-2 border-dashed border-indigo-500/30"
                />
              </div>
            </div>

            <h1 className="text-5xl font-black text-white mb-3 leading-tight">
              Flow<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-pink-500">CRM</span>
            </h1>
            <p className="text-slate-400 text-lg mb-2">
              The AI-Powered CRM trusted by{' '}
              <span className="text-white font-bold">{companies.length > 0 ? companies.length + '+' : '500+'}</span>{' '}
              businesses
            </p>

            {companies.length > 0 && <CompanyTicker companies={companies} />}

            <div className="flex items-center justify-center gap-8 mb-8 pt-2">
              <AnimatedStat value="98%" label="Satisfaction" color="#10b981" />
              <div className="w-px h-8 bg-white/10" />
              <AnimatedStat value="2.3x" label="Revenue Boost" color="#6366f1" />
              <div className="w-px h-8 bg-white/10" />
              <AnimatedStat value="&lt; 1ms" label="Response Time" color="#ec4899" />
            </div>

            <div className="flex flex-wrap justify-center gap-2">
              {[
                { icon: Zap, label: 'Real-time AI Insights', color: 'emerald' },
                { icon: ShieldCheck, label: 'Bank-grade Security', color: 'violet' },
                { icon: TrendingUp, label: 'Predictive Analytics', color: 'amber' },
              ].map((f) => (
                <div
                  key={f.label}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-slate-300 text-xs font-medium`}
                >
                  <f.icon size={12} />
                  {f.label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ========== RIGHT PANEL — Login Form ========== */}
      <div className="w-full lg:w-[45%] flex items-center justify-center p-8 sm:p-12 relative z-10">
        <div className="absolute inset-0 lg:hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-indigo-600/20 rounded-full blur-[120px]" />
        </div>

        <div className="w-full max-w-md">
          <div className="flex items-center gap-3 mb-10 lg:hidden">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-2xl shadow-indigo-500/30">
              <Sparkles className="text-white" size={24} />
            </div>
            <span className="text-2xl font-black text-white">FlowCRM</span>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">
              {isLogin ? 'Sign in to your workspace' : 'Create your account'}
            </h2>
            <p className="text-slate-500 font-medium text-sm">
              {isLogin ? 'Enter your credentials to continue.' : 'Start your free trial — no credit card needed.'}
            </p>
          </div>

          {errorMsg && (
            <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm rounded-xl mb-6 font-semibold">
              {errorMsg}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            {!isLogin && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Company / Workspace Name</label>
                <div className="relative group">
                  <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={20} />
                  <input
                    type="text"
                    placeholder="e.g. Acme Corp"
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-white focus:outline-none focus:border-indigo-500 focus:bg-white/10 transition-all placeholder:text-slate-600 font-medium"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Username</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={20} />
                <input
                  type="text"
                  placeholder="e.g. alexrivera"
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-white focus:outline-none focus:border-indigo-500 focus:bg-white/10 transition-all placeholder:text-slate-600"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
            </div>

            {!isLogin && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={20} />
                  <input
                    type="email"
                    placeholder="name@company.com"
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-white focus:outline-none focus:border-indigo-500 focus:bg-white/10 transition-all placeholder:text-slate-600"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <div className="flex items-center justify-between ml-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Password</label>
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={20} />
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-white focus:outline-none focus:border-indigo-500 focus:bg-white/10 transition-all placeholder:text-slate-600"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={authLoading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold py-4 rounded-xl shadow-xl shadow-indigo-500/30 transition-all flex items-center justify-center gap-2 group mt-4"
            >
              {authLoading ? 'Signing In...' : isLogin ? 'Sign In to Dashboard' : 'Start Free Trial'}
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </motion.button>

            {isLogin && (
              <motion.button
                type="button"
                disabled={authLoading}
                onClick={async () => {
                  setUsername('alex');
                  setPassword('password123');
                  const success = await login('alex', 'password123');
                  if (success) {
                    navigate('/');
                  } else {
                    setErrorMsg('Demo login failed');
                  }
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 mt-3"
              >
                <Sparkles size={18} className="text-indigo-400" />
                Login as Demo User
              </motion.button>
            )}
          </form>

          <div className="my-6 flex items-center gap-4">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-slate-600 text-xs font-medium">Trusted by teams at</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          <div className="flex items-center justify-center gap-3 flex-wrap mb-6">
            {companies.slice(0, 4).map((c) => (
              <div
                key={c.name}
                title={c.name}
                className="w-9 h-9 rounded-xl overflow-hidden border border-white/10 bg-white/5 flex items-center justify-center"
              >
                <img src={c.logoUrl} alt={c.name} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>

          <p className="text-center text-sm text-slate-500">
            {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setErrorMsg('');
              }}
              className="font-bold text-indigo-400 hover:text-white transition-colors"
            >
              {isLogin ? 'Sign up free' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
