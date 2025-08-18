import axios from 'axios';
import { ENV } from '../constants/env';
export const api = axios.create({ baseURL: ENV.API_BASE_URL, timeout: 10000 });
api.interceptors.response.use((r) => r, (error) => { console.warn('[API ERROR]', error?.response?.status, error?.message); return Promise.reject(error); });
