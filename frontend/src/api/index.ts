import axios from 'axios';

const api = axios.create({ 
  baseURL: (import.meta.env.VITE_API_URL || '') + '/api'
});

api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// Auth
export const login = (username: string, password: string) =>
  api.post('/auth/login', { username, password });

// Members
export const getMembers    = ()           => api.get('/members');
export const getMember     = (id: number) => api.get(`/members/${id}`);
export const createMember  = (data: any)  => api.post('/members', data);
export const updateMember  = (id: number, data: any) => api.put(`/members/${id}`, data);
export const toggleStatus  = (id: number) => api.patch(`/members/${id}`);

// Maintenance
export const generateMaintenance = (data: any) => api.post('/maintenance/generate', data);
export const getMaintenance      = ()           => api.get('/maintenance');
export const getMemberLedger     = (id: number) => api.get(`/maintenance/member/${id}/ledger`);

// Payments
export const getPayments  = ()           => api.get('/payments');
export const addPayment   = (data: any)  => api.post('/payments', data);
export const editPayment  = (id: number, data: any) => api.put(`/payments/${id}`, data);

// Notices
export const getNotices    = ()           => api.get('/notices');
export const createNotice  = (data: any)  => api.post('/notices', data);
export const updateNotice  = (id: number, data: any) => api.put(`/notices/${id}`, data);
export const deleteNotice  = (id: number) => api.delete(`/notices/${id}`);

// Complaints
export const getComplaints    = ()           => api.get('/complaints');
export const createComplaint  = (data: any)  => api.post('/complaints', data);
export const updateComplaint  = (id: number, data: any) => api.patch(`/complaints/${id}`, data);

// Reports
export const getMaintenanceReport = () => api.get('/reports/maintenance');
export const getDuesReport        = () => api.get('/reports/dues');

export default api;