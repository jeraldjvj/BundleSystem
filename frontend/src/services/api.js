import axios from 'axios';

const API_URL = 'http://localhost:3000/api/v1';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Enviar el user_id de la sesión en cada petición para validar estado en backend
api.interceptors.request.use((config) => {
  try {
    const stored = JSON.parse(localStorage.getItem('user') || 'null');
    const userId = stored?.userId ?? stored?.user_id ?? stored?.user?.userId;
    if (userId) config.headers['x-user-id'] = userId;
  } catch { /* ignore */ }
  return config;
});

// Si el backend responde 403 por cuenta inactiva, cerrar sesión
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const msg = error.response?.data?.error || '';
    if (error.response?.status === 403 && msg.toLowerCase().includes('inactiva')) {
      localStorage.removeItem('user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

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
  getStoresByUser: (userId) => api.get(`/stores/user/${userId}`),
  createStore: (data) => api.post('/stores', data),
  updateStore: (code, data) => api.patch(`/stores/${code}`, data),
  deleteStore: (code) => api.delete(`/stores/${code}`),
};

export const projectService = {
  getProjects: () => api.get('/projects'),
  getProject: (id) => api.get(`/projects/${id}`),
  createProject: (data) => api.post('/projects', data),
  updateProject: (id, data) => api.patch(`/projects/${id}`, data),
  deleteProject: (id) => api.delete(`/projects/${id}`),
};

export const bundleColorService = {
  getBundleColors: () => api.get('/bundle-colors'),
  getBundleColor: (id) => api.get(`/bundle-colors/${id}`),
  createBundleColor: (data) => api.post('/bundle-colors', data),
  updateBundleColor: (id, data) => api.patch(`/bundle-colors/${id}`, data),
  deleteBundleColor: (id) => api.delete(`/bundle-colors/${id}`),
};

export const bundleModelService = {
  getBundleModels: () => api.get('/bundle-models'),
  getBundleModel: (id) => api.get(`/bundle-models/${id}`),
  createBundleModel: (data) => api.post('/bundle-models', data),
  updateBundleModel: (id, data) => api.patch(`/bundle-models/${id}`, data),
  deleteBundleModel: (id) => api.delete(`/bundle-models/${id}`),
};

export const smartphoneModelService = {
  getSmartphoneModels: () => api.get('/smartphone-models'),
  getSmartphoneModel: (id) => api.get(`/smartphone-models/${id}`),
  createSmartphoneModel: (data) => api.post('/smartphone-models', data),
  updateSmartphoneModel: (id, data) => api.patch(`/smartphone-models/${id}`, data),
  deleteSmartphoneModel: (id) => api.delete(`/smartphone-models/${id}`),
};

export const distributorService = {
  getDistributors: () => api.get('/distributors'),
  getDistributor: (id) => api.get(`/distributors/${id}`),
  createDistributor: (data) => api.post('/distributors', data),
  updateDistributor: (id, data) => api.patch(`/distributors/${id}`, data),
  deleteDistributor: (id) => api.delete(`/distributors/${id}`),
};

export const smartphoneService = {
  getSmartphones: () => api.get('/smartphones'),
  getSmartphone: (id) => api.get(`/smartphones/${id}`),
  getByImei: (imei) => api.get(`/smartphones/imei/${encodeURIComponent(imei)}`),
  createSmartphone: (data) => api.post('/smartphones', data),
  updateSmartphone: (id, data) => api.patch(`/smartphones/${id}`, data),
  deleteSmartphone: (id) => api.delete(`/smartphones/${id}`),
};

export const bundleService = {
  getBundles: () => api.get('/bundles'),
  getBundle: (id) => api.get(`/bundles/${id}`),
  createBundle: (data) => api.post('/bundles', data),
  updateBundle: (id, data) => api.patch(`/bundles/${id}`, data),
  assignBundle: (id, data) => api.post(`/bundles/${id}/assign`, data),
  verifySerial: (serial, userId) => api.get(`/bundles/verify-serial/${encodeURIComponent(serial)}/${userId}`),
  deleteBundle: (id) => api.delete(`/bundles/${id}`),
};

export const reportService = {
  getSummary: (user) => api.get('/reports/summary', {
    params: { userId: user.userId, levelUser: user.levelUser },
  }),
};

export const bundleDeliveredService = {
  getDeliveries: () => api.get('/bundle-delivered'),
  createDelivery: (data) => api.post('/bundle-delivered', data),
  uploadPicture: (file) => {
    const fd = new FormData();
    fd.append('picture', file);
    return api.post('/bundle-delivered/upload-picture', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

export default api;
