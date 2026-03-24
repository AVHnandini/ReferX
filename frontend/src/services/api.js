import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 10000,
});

const token = localStorage.getItem('token');
if (token) api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

export const authService = {
  signup: (data) => api.post('/auth/signup', data),
  verifyOtp: (data) => api.post('/auth/verify-otp', data),
  login: (data) => api.post('/auth/login', data),
};

export const userService = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  uploadProfilePhoto: (formData) => api.post('/users/upload-photo', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getAllUsers: () => api.get('/users/all'),
  getAlumni: () => api.get('/users/alumni'),
  deleteUser: (id) => api.delete(`/users/${id}`),
};

export const jobService = {
  createJob: (data) => api.post('/jobs/create', data),
  getAllJobs: () => api.get('/jobs/all'),
  getRecommended: () => api.get('/jobs/recommend'),
  deleteJob: (id) => api.delete(`/jobs/${id}`),
};

export const referralService = {
  request: (data) => api.post('/referrals/request', data),
  respond: (id, data) => api.put(`/referrals/respond/${id}`, data),
  schedule: (id, data) => api.put(`/referrals/schedule/${id}`, data),
  cancel: (id) => api.put(`/referrals/cancel/${id}`),
  getStatus: () => api.get('/referrals/status'),
  getStudentReferrals: () => api.get('/referrals/student'),
  getAlumniReferrals: () => api.get('/referrals/alumni'),
  getAll: () => api.get('/referrals/all'),
  checkInterviewReminders: () => api.get('/referrals/reminders'),
};

export const chatService = {
  send: (data) => api.post('/chat/send', data),
  getMessages: (userId) => api.get(`/chat/messages/${userId}`),
  getConversations: () => api.get('/chat/conversations'),
};

export const adminService = {
  getAlumni: () => api.get('/admin/alumni'),
  verifyAlumni: (id, status) => api.put(`/admin/alumni/${id}/verify`, { status }),
  getStats: () => api.get('/admin/stats'),
};

export const notificationService = {
  getNotifications: () => api.get('/notifications'),
  markRead: (id) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/read-all'),
};

export const resumeService = {
  analyze: (text) => api.post('/resume/analyze', { resumeText: text }),
};

// Aliases for backward compatibility
export const usersAPI = userService;
export const chatAPI = chatService;
export const jobsAPI = jobService;
export const referralsAPI = referralService;
