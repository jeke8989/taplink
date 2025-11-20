import axios from 'axios';

// Используем относительные пути для API - nginx проксирует их на бэкенд
const api = axios.create({
  baseURL: '',
});

// Добавляем токен в заголовки автоматически
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;

