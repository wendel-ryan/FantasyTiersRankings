import axios from "axios";

const API = "http://localhost:8000";

export const login = async (email, password) => {
  const res = await axios.post(`${API}/login`, { email, password });
  return res.data;
};

export const register = async (email, password) => {
  const res = await axios.post(`${API}/register`, { email, password });
  return res.data;
};

export const resetPassword = async (email, password) => {
  const res = await axios.post(`${API}/new-password`, { email, password });
  return res.data;
};
