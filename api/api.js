import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',  // fallback if env not set
  timeout: 5000,
});

// ----------- Products -----------

// Get all products
export const getProducts = () => api.get('/products');

// Add a new product (for multipart/form-data like images, pass a FormData object)
export const addProduct = (productData) => api.post('/products', productData);

// Update product by ID
export const updateProduct = (id, productData) => api.put(`/products/${id}`, productData);

// Delete product by ID
export const deleteProduct = (id) => api.delete(`/products/${id}`);


// ----------- Receipts -----------

// Get all receipts
export const getReceipts = () => api.get('/receipts');

// Add a new receipt
export const addReceipt = (receiptData) => api.post('/receipts', receiptData);


// ----------- Admin -----------

export const adminLogin = (credentials) => api.post('/admin/login', credentials);

export const adminRegister = (adminData) => api.post('/admin/register', adminData);

export default api;
