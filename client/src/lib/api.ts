import axios from 'axios';
import { auth } from './firebase';

export const api = axios.create({ baseURL: '/api' });

api.interceptors.request.use(async (config) => {
  const token = await auth?.currentUser?.getIdToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
