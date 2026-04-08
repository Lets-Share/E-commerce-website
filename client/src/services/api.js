import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://ecommerce-api-4lnx.onrender.com/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth services
export const authService = {
  signup: (email, password, fullName) =>
    api.post('/auth/signup', { email, password, fullName }),
  login: (email, password) =>
    api.post('/auth/login', { email, password }),
  getMe: () => api.get('/auth/me'),
};

// Product services
export const productService = {
  getAll: (params) => api.get('/products', { params }),
  getById: (id) => api.get(`/products/${id}`),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
};

// Cart services
export const cartService = {
  get: () => api.get('/cart'),
  add: (productId, quantity, selectedColor, selectedSize, selectedMaterial, selectedPattern) =>
    api.post('/cart/add', { productId, quantity, selectedColor, selectedSize, selectedMaterial, selectedPattern }),
  update: (productId, quantity, selectedColor, selectedSize, selectedMaterial, selectedPattern) =>
    api.put(`/cart/${productId}`, { quantity, selectedColor, selectedSize, selectedMaterial, selectedPattern }),
  remove: (productId, selectedColor, selectedSize, selectedMaterial, selectedPattern) => 
    api.delete(`/cart/${productId}`, { data: { selectedColor, selectedSize, selectedMaterial, selectedPattern } }),
  clear: () => api.delete('/cart'),
};

// Order services
export const orderService = {
  create: (shippingAddress, phone) =>
    api.post('/orders/create', { shippingAddress, phone }),
  getAll: () => api.get('/orders'),
  getById: (id) => api.get(`/orders/${id}`),
};

// Admin services
export const adminService = {
  getOrders: () => api.get('/admin/orders/all'),
  getOrderDetails: (id) => api.get(`/admin/orders/${id}`),
  updateOrderStatus: (id, status) =>
    api.put(`/admin/orders/${id}/status`, { status }),
  getInventory: () => api.get('/admin/inventory'),
  updateInventory: (id, stock) =>
    api.put(`/admin/inventory/${id}`, { stock }),
  getStats: () => api.get('/admin/stats'),
  getSalesChart: () => api.get('/admin/sales-chart'),
  getTopProducts: () => api.get('/admin/top-products'),
  getLowStock: () => api.get('/admin/low-stock'),
  getCustomers: () => api.get('/admin/customers'),
  getCategorySales: () => api.get('/admin/category-sales'),
  deleteProduct: (id) => api.delete(`/admin/product/${id}`),
  updateProduct: (id, data) => api.put(`/admin/product/${id}`, data),
};

// Upload service (note: uses axios directly to avoid /api prefix since server route is /api/upload)
export const uploadService = {
  uploadImage: (file) => {
    const formData = new FormData();
    formData.append('image', file);
    return axios.post(`${API_BASE_URL}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

export default api;
