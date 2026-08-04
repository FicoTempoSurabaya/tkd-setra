/**
 * Axios HTTP Client
 * Sumber: SSoT/00_stack_technology.md (Axios)
 */

import axios from 'axios';
import type { AxiosError, AxiosInstance } from 'axios';
import type { ApiResponse } from '@/lib/shared.js';

const client: AxiosInstance = axios.create({
  baseURL: '/api',
  timeout: 30000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

client.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiResponse>) => {
    if (error.response) {
      const { status, data } = error.response;
      const message = data?.message || 'Terjadi kesalahan';

      if (status === 401) {
        if (!window.location.pathname.includes('/admin/login')) {
          window.location.href = '/admin/login';
        }
      }

      return Promise.reject({
        status,
        message,
        errors: data?.errors,
      });
    }

    if (error.request) {
      return Promise.reject({
        status: 0,
        message: 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.',
      });
    }

    return Promise.reject({
      status: 0,
      message: error.message || 'Terjadi kesalahan tidak terduga',
    });
  },
);

export default client;