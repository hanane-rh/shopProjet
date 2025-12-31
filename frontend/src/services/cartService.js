import api from '../utils/axiosConfig';

export const getCart = async () => {
  const response = await api.get('shop/cart/');
  return response.data;
};

export const addToCart = async (productId, quantity = 1) => {
  const response = await api.post('shop/cart/', { product: productId, quantity });
  return response.data;
};

export const updateCartItem = async (cartItemId, quantity) => {
  const response = await api.put(`shop/cart/${cartItemId}/`, { quantity });
  return response.data;
};

export const deleteCartItem = async (cartItemId) => {
  const response = await api.delete(`shop/cart/${cartItemId}/`);
  return response.data;
};
