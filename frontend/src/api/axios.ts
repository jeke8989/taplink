import axios from 'axios';

// В dev режиме используем прямой URL к бэкенду, в production - относительные пути (nginx проксирует)
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:3000' : ''),
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

