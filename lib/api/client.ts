/**
 * Axios API Client
 * Backend API ile iletişim için axios instance
 */

import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

// API Base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

/**
 * Axios instance oluştur
 */
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000, // 60 saniye (e-ticaret araması için)
});

/**
 * Request Interceptor
 * Her istekte token'ı ekle
 */
apiClient.interceptors.request.use(
  (config) => {
    // Token'ı localStorage'dan al
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor
 * Hata yönetimi ve token refresh
 */
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    // 401 Unauthorized - Token geçersiz veya yok
    if (error.response?.status === 401) {
      // Token'ı temizle
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');

        // Login sayfasına yönlendir (sadece admin panelde değilse)
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      }
    }

    // 403 Forbidden - Yetkisiz erişim
    if (error.response?.status === 403) {
      console.error('Yetkisiz erişim:', error.response.data);
    }

    // 409 Conflict - Çakışma (duplicate değerler)
    if (error.response?.status === 409) {
      console.error('Veri çakışması:', error.response.data);
    }

    // 500 Internal Server Error
    if (error.response?.status === 500) {
      console.error('Sunucu hatası:', {
        url: error.config?.url,
        method: error.config?.method,
        data: JSON.parse(error.config?.data || '{}'),
        response: error.response.data
      });
      console.error('Full error:', error);
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
    }

    return Promise.reject(error);
  }
);

/**
 * API Error Class
 */
export class ApiError extends Error {
  constructor(
    public message: string,
    public status?: number,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * HTTP Request Helper Functions
 */

export const api = {
  /**
   * GET request
   */
  get: async <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    try {
      const response = await apiClient.get<T>(url, config);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * POST request
   */
  post: async <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    try {
      const response = await apiClient.post<T>(url, data, config);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * PUT request
   */
  put: async <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    try {
      const response = await apiClient.put<T>(url, data, config);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * PATCH request
   */
  patch: async <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    try {
      const response = await apiClient.patch<T>(url, data, config);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * DELETE request
   */
  delete: async <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    try {
      const response = await apiClient.delete<T>(url, config);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * File upload
   */
  upload: async <T = any>(url: string, formData: FormData, onProgress?: (progress: number) => void): Promise<T> => {
    try {
      const response = await apiClient.post<T>(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(percentCompleted);
          }
        },
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
};

/**
 * Error Handler
 */
function handleApiError(error: any): ApiError {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError;
    const message = (axiosError.response?.data as any)?.error ||
                   (axiosError.response?.data as any)?.message ||
                   axiosError.message ||
                   'Bir hata oluştu';
    const status = axiosError.response?.status;
    const data = axiosError.response?.data;

    return new ApiError(message, status, data);
  }

  return new ApiError('Beklenmeyen bir hata oluştu');
}

export default apiClient;
