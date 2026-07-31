import { create } from 'zustand';
import api from './api';

export const useStore = create((set, get) => ({
  // --- AUTH & TENANT STATE ---
  token: localStorage.getItem('accessToken') || null,
  refreshToken: localStorage.getItem('refreshToken') || null,
  user: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null,
  company: localStorage.getItem('activeCompany') ? JSON.parse(localStorage.getItem('activeCompany')) : null,
  isAuthenticated: !!localStorage.getItem('accessToken'),
  authLoading: false,
  authError: null,

  login: async (username, password) => {
    set({ authLoading: true, authError: null });
    try {
      const response = await api.post('/auth/login', { username, password });
      const { accessToken, refreshToken, role, companyId } = response.data;
      
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      const userProfile = { username, role, companyId };
      localStorage.setItem('user', JSON.stringify(userProfile));

      // Resolve Company details from DB
      let companyDetails = null;
      try {
        const companiesRes = await api.get('/companies');
        companyDetails = companiesRes.data.find(c => c.id === companyId);
      } catch (err) {
        console.warn("Couldn't fetch company list during login, falling back to dummy", err);
      }
      
      if (!companyDetails) {
        companyDetails = { id: companyId, name: "Workspace " + companyId, primaryColor: "#6366f1" };
      }

      localStorage.setItem('activeCompany', JSON.stringify(companyDetails));

      set({
        token: accessToken,
        refreshToken,
        user: userProfile,
        company: companyDetails,
        isAuthenticated: true,
        authLoading: false
      });
      return true;
    } catch (error) {
      set({ authLoading: false, authError: error.response?.data?.message || 'Login failed' });
      return false;
    }
  },

  register: async (username, email, password, companyName) => {
    set({ authLoading: true, authError: null });
    try {
      // 1. Create company first
      const sub = companyName.toLowerCase().replace(/[^a-z0-9]/g, '');
      const premiumColors = ['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
      const randomColor = premiumColors[Math.floor(Math.random() * premiumColors.length)];
      
      const newCompanyData = {
        name: companyName,
        subdomain: sub || `company${Date.now()}`,
        logoUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(companyName)}&backgroundColor=${randomColor.replace('#', '')}`,
        primaryColor: randomColor,
        industry: 'Software & Technology',
        website: `https://${sub || 'company'}.com`,
        contactEmail: email,
        plan: 'Enterprise',
        active: true
      };

      const compRes = await api.post('/companies', newCompanyData);
      const createdCompany = compRes.data;

      // 2. Register user associated with the new company ID
      await api.post('/auth/register', {
        username,
        email,
        password,
        role: 'ADMIN',
        companyId: createdCompany.id
      });

      set({ authLoading: false });
      return true;
    } catch (error) {
      set({ authLoading: false, authError: error.response?.data?.message || 'Registration failed' });
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    localStorage.removeItem('activeCompany');
    set({
      token: null,
      refreshToken: null,
      user: null,
      company: null,
      isAuthenticated: false
    });
  },

  // --- LEADS STATE ---
  leads: [],
  leadsLoading: false,
  fetchLeads: async () => {
    set({ leadsLoading: true });
    try {
      const res = await api.get('/leads');
      set({ leads: res.data, leadsLoading: false });
    } catch (error) {
      set({ leadsLoading: false });
    }
  },
  createLead: async (leadData) => {
    const res = await api.post('/leads', leadData);
    set(state => ({ leads: [...state.leads, res.data] }));
    return res.data;
  },
  updateLead: async (id, leadDetails) => {
    const res = await api.put(`/leads/${id}`, leadDetails);
    set(state => ({
      leads: state.leads.map(l => l.id === id ? res.data : l)
    }));
    return res.data;
  },
  deleteLead: async (id) => {
    await api.delete(`/leads/${id}`);
    set(state => ({
      leads: state.leads.filter(l => l.id !== id)
    }));
  },

  // --- WHATSAPP INBOX STATE ---
  chats: [],
  activeChatId: null,
  messages: [],
  chatsLoading: false,
  messagesLoading: false,

  fetchChats: async () => {
    set({ chatsLoading: true });
    try {
      const res = await api.get('/whatsapp/chats');
      set({ chats: res.data, chatsLoading: false });
    } catch (error) {
      set({ chatsLoading: false });
    }
  },

  fetchMessages: async (chatId) => {
    set({ messagesLoading: true, activeChatId: chatId });
    try {
      const res = await api.get(`/whatsapp/chats/${chatId}/messages`);
      set({ messages: res.data, messagesLoading: false });
      
      // Update local chats list unreadCount back to 0
      set(state => ({
        chats: state.chats.map(c => c.id === chatId ? { ...c, unreadCount: 0 } : c)
      }));
    } catch (error) {
      set({ messagesLoading: false });
    }
  },

  sendWhatsAppMessage: async (chatId, text, agentName) => {
    const res = await api.post(`/whatsapp/chats/${chatId}/send`, { text, agentName });
    set(state => ({
      messages: [...state.messages, res.data],
      chats: state.chats.map(c => c.id === chatId ? { ...c, lastMessageText: text, lastMessageTime: new Date().toISOString() } : c)
    }));
  },

  addWhatsAppNote: async (chatId, text, agentName) => {
    const res = await api.post(`/whatsapp/chats/${chatId}/note`, { text, agentName });
    set(state => ({
      messages: [...state.messages, res.data]
    }));
  },

  simulateInboundMessage: async (phone, name, text) => {
    const res = await api.post('/whatsapp/simulate-inbound', { phone, name, text });
    
    // Refresh chats to capture new entries
    const chatsRes = await api.get('/whatsapp/chats');
    set({ chats: chatsRes.data });

    // If currently viewing this chat, append message
    const activeId = get().activeChatId;
    if (activeId) {
      const activeChat = chatsRes.data.find(c => c.id === activeId);
      if (activeChat && activeChat.customerPhone === phone) {
        const msgsRes = await api.get(`/whatsapp/chats/${activeId}/messages`);
        set({ messages: msgsRes.data });
      }
    }
  },

  // --- TASKS STATE ---
  tasks: [],
  tasksLoading: false,
  fetchTasks: async () => {
    set({ tasksLoading: true });
    try {
      const res = await api.get('/tasks');
      set({ tasks: res.data, tasksLoading: false });
    } catch (error) {
      set({ tasksLoading: false });
    }
  },
  createTask: async (taskData) => {
    const res = await api.post('/tasks', taskData);
    set(state => ({ tasks: [...state.tasks, res.data] }));
    return res.data;
  },
  toggleTask: async (id) => {
    const res = await api.patch(`/tasks/${id}/toggle`);
    set(state => ({
      tasks: state.tasks.map(t => t.id === id ? res.data : t)
    }));
  },
  deleteTask: async (id) => {
    await api.delete(`/tasks/${id}`);
    set(state => ({
      tasks: state.tasks.filter(t => t.id !== id)
    }));
  },

  // --- WORKFLOWS STATE ---
  workflows: [],
  workflowsLoading: false,
  fetchWorkflows: async () => {
    set({ workflowsLoading: true });
    try {
      const res = await api.get('/workflows');
      set({ workflows: res.data, workflowsLoading: false });
    } catch (error) {
      set({ workflowsLoading: false });
    }
  },
  createWorkflow: async (workflowData) => {
    const res = await api.post('/workflows', workflowData);
    set(state => ({ workflows: [...state.workflows, res.data] }));
    return res.data;
  },
  updateWorkflow: async (id, workflowDetails) => {
    const res = await api.put(`/workflows/${id}`, workflowDetails);
    set(state => ({
      workflows: state.workflows.map(w => w.id === id ? res.data : w)
    }));
    return res.data;
  },
  deleteWorkflow: async (id) => {
    await api.delete(`/workflows/${id}`);
    set(state => ({
      workflows: state.workflows.filter(w => w.id !== id)
    }));
  },

  // --- NOTIFICATIONS STATE ---
  notifications: [],
  fetchNotifications: async () => {
    const res = await api.get('/notifications');
    set({ notifications: res.data });
  },
  addNotificationLocally: (notif) => {
    set(state => ({ notifications: [notif, ...state.notifications] }));
  },
  readNotification: async (id) => {
    const res = await api.patch(`/notifications/${id}/read`);
    set(state => ({
      notifications: state.notifications.map(n => n.id === id ? res.data : n)
    }));
  },

  // --- TEAM USERS STATE ---
  users: [],
  usersLoading: false,
  fetchUsers: async () => {
    set({ usersLoading: true });
    try {
      const res = await api.get('/users');
      set({ users: res.data, usersLoading: false });
    } catch (error) {
      set({ usersLoading: false });
    }
  },
  createTeamUser: async (userData) => {
    const res = await api.post('/users', userData);
    set(state => ({ users: [...state.users, res.data] }));
    return res.data;
  },
  toggleUserActive: async (id) => {
    const res = await api.patch(`/users/${id}/toggle`);
    set(state => ({
      users: state.users.map(u => u.id === id ? { ...u, active: res.data.active } : u)
    }));
    return res.data;
  },
  deleteTeamUser: async (id) => {
    await api.delete(`/users/${id}`);
    set(state => ({
      users: state.users.filter(u => u.id !== id)
    }));
  }
}));
