import axios from 'axios';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'https://coachingbuddy.co.in/api';
const AUTH_TOKEN_KEY = 'COACHING_BUDDY_MERCHANT_AUTH_TOKEN';

export const api = axios.create({
  baseURL: SERVER_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle unauthorized logout
    if (error.response?.status === 401) {
      localStorage.removeItem(AUTH_TOKEN_KEY);
    }
    return Promise.reject(error);
  }
);

export const setStoredAuthToken = (token: string) => {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
};

export const getStoredAuthToken = () => {
  return localStorage.getItem(AUTH_TOKEN_KEY);
};

export const removeStoredAuthToken = () => {
  localStorage.removeItem(AUTH_TOKEN_KEY);
};

export default api;
