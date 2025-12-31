import api from "../utils/axiosConfig";

// LOGIN
export const login = async (username, password) => {
  const response = await api.post("accounts/login/", { username, password });
  localStorage.setItem("token", response.data.token);
  localStorage.setItem("user", JSON.stringify(response.data.user));
  return response.data;
};

// REGISTER
export const register = async (data) => {
  const response = await api.post("accounts/register/", data);
  return response.data;
};

// LOGOUT
export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

// AUTH CHECK
export const isAuthenticated = () => !!localStorage.getItem("token");
