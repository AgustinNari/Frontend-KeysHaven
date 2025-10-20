import api from './api';

// Servicios públicos de productos
export const getProducts = (filters = {}) => 
  api.get('/products', { params: filters });

export const getProductById = (productId) => 
  api.get(`/products/${productId}`);

export const getCategories = () => 
  api.get('/categories');