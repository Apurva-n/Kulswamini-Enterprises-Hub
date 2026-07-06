import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

export const authApi = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  me: () => api.get('/auth/me'),
};

export const shopApi = {
  list: (params) => api.get('/shops', { params }),
  create: (data) => api.post('/shops', data),
  update: (id, data) => api.patch(`/shops/${id}`, data),
  get: (id) => api.get(`/shops/${id}`),
};

export const categoryApi = {
  list: () => api.get('/categories'),
  create: (data) => api.post('/categories', data),
  update: (id, data) => api.patch(`/categories/${id}`, data),
};

export const productApi = {
  list: (params) => api.get('/products', { params }),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.patch(`/products/${id}`, data),
};

export const orderApi = {
  list: (params) => api.get('/orders', { params }),
  create: (data) => api.post('/orders', data),
  updateStatus: (id, status) => api.patch(`/orders/${id}/status`, { status }),
  invoiceUrl: (id) => `/api/orders/${id}/invoice`,
};

export const ledgerApi = {
  get: (shopId, params) => api.get(`/ledger/${shopId}`, { params }),
};

export const paymentApi = {
  create: (data) => api.post('/payments', data),
  list: (shopId) => api.get(`/payments/${shopId}`),
  receiptUrl: (id) => `/api/payments/receipt/${id}`,
};

export const userApi = {
  pending: () => api.get('/users/pending'),
  approve: (id, data) => api.patch(`/users/${id}/approve`, data),
};

export const dashboardApi = {
  summary: () => api.get('/dashboard/summary'),
};

export default api;
