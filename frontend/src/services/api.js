import axios from 'axios';

const API_URL = 'http://localhost:3000/api/v1';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const authService = {
  login: (email, password) => api.post('/login', { email, password }),
};

export const userService = {
  getUsers: () => api.get('/users'),
  getUser: (id) => api.get(`/users/${id}`),
  getUserByMiId: (miId) => api.get(`/users?mi_id=${miId}`),
  createUser: (data) => api.post('/users', data),
  updateUser: (id, data) => api.patch(`/users/${id}`, data),
  deleteUser: (id) => api.delete(`/users/${id}`),
};

export const storeService = {
  getStores: () => api.get('/stores'),
  getStore: (code) => api.get(`/stores/${code}`),
  createStore: (data) => api.post('/stores', data),
  updateStore: (code, data) => api.patch(`/stores/${code}`, data),
  deleteStore: (code) => api.delete(`/stores/${code}`),
};

export default api;
