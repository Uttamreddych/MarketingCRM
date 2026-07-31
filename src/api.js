import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Automatically attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Handle 401 Unauthorized and 403 Forbidden responses globally with token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Check if the error is 401 or 403 and the request hasn't been retried yet
    if ((error.response?.status === 401 || error.response?.status === 403) && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        handleLogoutRedirect();
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      isRefreshing = true;

      try {
        // Use a clean raw axios instance to call refresh endpoint to avoid interceptor loop
        const refreshResponse = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken });
        const { accessToken } = refreshResponse.data;

        localStorage.setItem('accessToken', accessToken);

        api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
        originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;

        processQueue(null, accessToken);
        isRefreshing = false;

        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        isRefreshing = false;
        handleLogoutRedirect();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

function handleLogoutRedirect() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
  localStorage.removeItem('activeCompany');
  if (window.location.pathname !== '/auth') {
    window.location.href = '/auth';
  }
}

export const leadService = {
  getAll: () => api.get('/leads'),
  getById: (id) => api.get(`/leads/${id}`),
  create: (lead) => api.post('/leads', lead),
  update: (id, lead) => api.put(`/leads/${id}`, lead),
  delete: (id) => api.delete(`/leads/${id}`),
  getActivities: (id) => api.get(`/leads/${id}/activities`),
  logActivity: (id, activity) => api.post(`/leads/${id}/activities`, activity),
};

export const campaignService = {
  getAll: () => api.get('/campaigns'),
  create: (campaign) => api.post('/campaigns', campaign),
};

export const dashboardService = {
  getStats: () => api.get('/dashboard/stats')
};

export const companyService = {
  getAll: () => api.get('/companies'),
  getBySubdomain: (sub) => api.get(`/companies/subdomain/${sub}`),
  getById: (id) => api.get(`/companies/${id}`),
  create: (data) => api.post('/companies', data),
};

export const aiService = {
  scoreLead: (leadData) => api.post('/ai/score-lead', { leadData }),
  getPredictions: () => api.get('/ai/sales-prediction'),
  getRecommendations: () => api.get('/ai/recommendations'),
  chat: (message, history) => api.post('/ai/chat', { message, history }),
  generateFollowUp: (leadId) => api.post(`/ai/generate-followup`, { leadId }),
  summarizeMeeting: (text) => api.post(`/ai/summarize-meeting`, { text }),
  parseVoiceInput: (transcript) => api.post(`/ai/parse-voice`, { transcript }),
};

export const crmHealthService = {
  getMissedOpportunities: () => api.get('/health/missed-opportunities'),
  analyze: () => api.get('/health/analyze'),
  runCleanup: () => api.post('/health/cleanup'),
};

export default api;
