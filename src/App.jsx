import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Layout, 
  Megaphone, 
  BarChart, 
  Settings as SettingsIcon, 
  PlusCircle, 
  Search, 
  Bell, 
  Sparkles,
  ChevronRight,
  LogOut,
  UserCircle,
  Sun,
  Moon,
  MessageSquare,
  Cpu,
  CheckSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from './store';

import Dashboard from './pages/Dashboard';
import Leads from './pages/Leads';
import Pipeline from './pages/Pipeline';
import Auth from './pages/Auth';
import AICommandCenter from './components/AICommandCenter';
import Settings from './pages/Settings';
import Campaigns from './pages/Campaigns';
import Analytics from './pages/Analytics';
import Inbox from './pages/Inbox';
import Automations from './pages/Automations';
import Tasks from './pages/Tasks';
import Team from './pages/Team';

const SidebarItem = ({ icon: Icon, label, path, active }) => (
  <Link to={path}>
    <motion.div
      whileHover={{ x: 5 }}
      whileTap={{ scale: 0.95 }}
      className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 group ${
        active 
          ? 'bg-primary text-white shadow-lg shadow-primary/30' 
          : 'text-slate-400 hover:text-white hover:bg-white/5'
      }`}
    >
      <Icon size={18} className={active ? 'text-white' : 'group-hover:text-primary transition-colors'} />
      <span className="font-medium text-xs">{label}</span>
      {active && (
        <motion.div 
          layoutId="active-indicator"
          className="ml-auto w-1.5 h-1.5 rounded-full bg-white"
        />
      )}
    </motion.div>
  </Link>
);

const Sidebar = ({ onLogout, company }) => {
  const location = useLocation();
  const { user } = useStore();
  if (location.pathname === '/auth') return null;

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: MessageSquare, label: 'Shared Inbox', path: '/inbox' },
    { icon: Users, label: 'Leads', path: '/leads' },
    { icon: Layout, label: 'Pipeline', path: '/pipeline' },
    { icon: CheckSquare, label: 'Tasks & Planner', path: '/tasks' },
    { icon: Megaphone, label: 'Campaigns', path: '/campaigns' },
    { icon: Cpu, label: 'Automations', path: '/automations' },
    { icon: BarChart, label: 'Analytics', path: '/analytics' },
  ];

  if (user?.role === 'ADMIN') {
    menuItems.push({ icon: UserCircle, label: 'Manage Team', path: '/team' });
  }

  return (
    <aside className="w-60 h-screen glass-dark border-r border-white/5 flex flex-col p-4 fixed left-0 top-0 z-50">
      {/* Brand / Company Logo */}
      <div className="flex items-center gap-3 px-3 py-6">
        {company?.logoUrl ? (
          <div className="w-9 h-9 rounded-xl overflow-hidden border border-white/10 shadow-lg flex-shrink-0">
            <img src={company.logoUrl} alt={company.name} className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary to-violet-400 flex items-center justify-center shadow-lg shadow-primary/20">
            <Sparkles className="text-white" size={20} />
          </div>
        )}
        <div className="overflow-hidden">
          <span className="text-sm font-bold text-white truncate block leading-tight">
            {company?.name || 'FlowCRM'}
          </span>
          {company?.plan && (
            <span className="text-[9px] font-bold uppercase tracking-widest text-primary">
              {company.plan} Plan
            </span>
          )}
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto">
        {menuItems.map((item) => (
          <SidebarItem 
            key={item.path}
            {...item}
            active={location.pathname === item.path}
          />
        ))}
      </nav>

      <div className="pt-4 border-t border-white/5 space-y-1">
        <SidebarItem icon={SettingsIcon} label="Settings" path="/settings" active={location.pathname === '/settings'} />
        <button 
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-400/5 transition-all duration-300 text-xs"
        >
          <LogOut size={18} />
          <span className="font-medium text-xs">Logout</span>
        </button>
      </div>
    </aside>
  );
};

const Navbar = ({ toggleTheme, theme, user, company }) => {
  const location = useLocation();
  if (location.pathname === '/auth') return null;

  return (
    <header className="h-20 glass-dark border-b border-white/5 sticky top-0 z-40 px-8 flex items-center justify-between">
      <div className="relative w-80 group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors" size={16} />
        <input 
          type="text" 
          placeholder="Search leads, campaigns..."
          className="w-full bg-slate-900/50 border border-white/5 rounded-full py-2 pl-11 pr-4 text-xs focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-slate-600"
        />
      </div>

      <div className="flex items-center gap-6">
        <button 
          onClick={toggleTheme} 
          className="relative p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all"
          title="Toggle Theme"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <button className="relative p-2 text-slate-400 hover:text-white transition-colors">
          <Bell size={18} />
          <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-rose-500 rounded-full border-2 border-surface" />
        </button>
        
        <div className="h-8 w-px bg-white/5" />

        <div className="flex items-center gap-3 cursor-pointer group">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-semibold text-white group-hover:text-primary transition-colors">
              {user?.username || 'Alex Rivera'}
            </p>
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
              {user?.role || 'Admin'}
            </p>
          </div>
          <div className="relative">
            <div className="w-8 h-8 rounded-full border-2 border-primary/20 group-hover:border-primary transition-colors overflow-hidden">
              <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username || 'Alex'}`} alt="Avatar" />
            </div>
            {company?.primaryColor && (
              <span
                className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-surface"
                style={{ backgroundColor: company.primaryColor }}
              />
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

const AppLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const { isAuthenticated, logout, user, company } = useStore();
  
  const [isAICenterOpen, setIsAICenterOpen] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  
  const isAuthPage = location.pathname === '/auth';

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  useEffect(() => {
    if (!isAuthenticated && !isAuthPage) {
      navigate('/auth');
    }
  }, [isAuthenticated, isAuthPage, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-surface flex text-slate-200">
      <Sidebar onLogout={handleLogout} company={company} />
      
      <main className={`flex-1 flex flex-col relative transition-all duration-300 ${isAuthPage ? '' : 'ml-60'}`}>
        <Navbar toggleTheme={toggleTheme} theme={theme} user={user} company={company} />
        
        <div className="flex-1">
          <Routes>
            <Route path="/" element={isAuthenticated ? <Dashboard /> : <Navigate to="/auth" />} />
            <Route path="/leads" element={isAuthenticated ? <Leads /> : <Navigate to="/auth" />} />
            <Route path="/pipeline" element={isAuthenticated ? <Pipeline /> : <Navigate to="/auth" />} />
            <Route path="/inbox" element={isAuthenticated ? <Inbox /> : <Navigate to="/auth" />} />
            <Route path="/tasks" element={isAuthenticated ? <Tasks /> : <Navigate to="/auth" />} />
            <Route path="/campaigns" element={isAuthenticated ? <Campaigns /> : <Navigate to="/auth" />} />
            <Route path="/automations" element={isAuthenticated ? <Automations /> : <Navigate to="/auth" />} />
            <Route path="/analytics" element={isAuthenticated ? <Analytics /> : <Navigate to="/auth" />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/settings" element={isAuthenticated ? <Settings /> : <Navigate to="/auth" />} />
            <Route path="/team" element={isAuthenticated ? <Team /> : <Navigate to="/auth" />} />
          </Routes>
        </div>
      </main>

      <AICommandCenter isOpen={isAICenterOpen} onClose={() => setIsAICenterOpen(false)} />

      <AnimatePresence>
        {!isAuthPage && isAuthenticated && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsAICenterOpen(true)}
            className="fixed bottom-8 right-8 w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-violet-600 flex items-center justify-center shadow-2xl shadow-primary/40 group z-50"
          >
            <Sparkles className="text-white group-hover:animate-pulse" size={24} />
            <div className="absolute -top-12 right-0 bg-slate-900 text-white text-[9px] font-bold py-2 px-3 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-white/10 uppercase tracking-widest">
              Ask Flow AI
            </div>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};

function App() {
  return (
    <Router>
      <AppLayout />
    </Router>
  );
}

export default App;
