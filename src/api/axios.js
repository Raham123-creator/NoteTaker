import axios from "axios";

// Axios instance with base URL from environment
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Request interceptor: attach JWT token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;
