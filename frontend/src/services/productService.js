// src/services/productService.js
import api from '../utils/axiosConfig';

export const getAllProducts = async (page = 1, category = '', search = '') => {
  const response = await api.get(`shop/products/?page=${page}&category=${category}&search=${search}`);
  return response.data;
};

export const getProductBySlug = async (slug) => {
  const response = await api.get(`shop/products/${slug}/`);
  return response.data;
};

export const getFeaturedProducts = async () => {
  const response = await api.get('shop/products/featured/');
  return response.data.results;
};

export const getCategories = async () => {
  const response = await api.get('shop/categories/');
  return response.data;
};
