import axios from 'axios';

const API_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const auth = {
  login: (data) => {
    const params = new URLSearchParams();
    params.append('username', data.email);
    params.append('password', data.password);
    return api.post('/auth/login', params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
  },
  signup: (data) => api.post('/auth/signup', data),
};

export const astrologer = {
  getProfile: () => api.get('/api/astrologers/me'),
  apply: (data) => api.post('/api/astrologers/apply', data),
  getAll: () => api.get('/api/astrologers/'),
  getById: (id) => api.get(`/api/astrologers/${id}`),
  updateStatus: (isOnline) => api.put('/api/astrologers/me/status', { is_online: isOnline }),
  updateRate: (rate) => api.put('/api/astrologers/me/rate', { rate }),
  toggleBoost: () => api.post('/api/astrologers/me/boost'),
  goLive: () => api.post('/api/astrologers/me/live'),
  getSessions: () => api.get('/api/astrologers/me/sessions'),
};

export const users = {
  getProfile: () => api.get('/api/users/me'),
  updateProfile: (data) => api.put('/api/users/me', data),
};

export const admin = {
  getApplications: () => api.get('/api/admin/applications'),
  verifyAstrologer: (email, status) => api.put(`/api/admin/verify/${email}?status=${status}`),
};

export const wallet = {
  getBalance: () => api.get('/api/wallet/balance'),
  addFunds: (amount) => api.post(`/api/wallet/add-funds?amount=${amount}`),
};

export const chat = {
  sendMessage: (data) => api.post('/api/chat/', data),
};

export const features = {
  getDailyPanchang: () => api.get('/api/features/panchang/daily'),
  getDailyHoroscope: () => api.get('/api/features/horoscope/daily'),
  getShopItems: () => api.get('/api/features/shop/items'),
  getNews: () => api.get('/api/features/news'),
  getAvailableReports: () => api.get('/api/features/reports/available'),
  getInsight: (category) => api.get(`/api/features/insights/${category}`),
  checkMatching: (boyData, girlData) => api.post('/api/features/matching/check', { boy_details: boyData, girl_details: girlData }),
  generateKundli: (data) => api.post('/api/features/kundli/generate', data),
};

export const sessions = {
  start: (astrologerId) => api.post('/api/sessions/start', { astrologer_id: astrologerId }),
  getById: (sessionId) => api.get(`/api/sessions/${sessionId}`),
  end: (sessionId) => api.post(`/api/sessions/${sessionId}/end`),
  getActive: () => api.get('/api/sessions/active'),
};

export default api;
