import axios from 'axios';

// Automatically switch between localhost and production
const baseURL = window.location.hostname === 'localhost' 
  ? 'http://localhost:5000/api' 
  : '/api';

const api = axios.create({ baseURL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers['x-auth-token'] = token;
  }
  return config;
});

export default api;