/**
 * API Client
 * Backend API ile iletişim için fetch wrapper
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

// API Response tipi
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// API hata sınıfı
export class ApiError extends Error {
  constructor(public message: string, public status?: number) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Fetch wrapper - backend'e istek gönderir
 */
async function fetchAPI<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_URL}${endpoint}`;

  // Token'ı localStorage'dan al
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  // Headers
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Token varsa ekle
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new ApiError(
        data.error || data.message || 'Bir hata oluştu',
        response.status
      );
    }

    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('Sunucuya bağlanılamadı');
  }
}

/**
 * Auth API fonksiyonları
 */
export const authAPI = {
  /**
   * Kullanıcı kaydı
   */
  register: async (email: string, password: string, name?: string) => {
    return fetchAPI<{
      success: boolean;
      token: string;
      user: {
        id: string;
        email: string;
        name: string | null;
        role: string;
        createdAt: string;
      };
    }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
  },

  /**
   * Kullanıcı girişi
   */
  login: async (email: string, password: string) => {
    return fetchAPI<{
      success: boolean;
      token: string;
      user: {
        id: string;
        email: string;
        name: string | null;
        role: string;
        createdAt: string;
      };
    }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  /**
   * Şifre sıfırlama isteği
   */
  forgotPassword: async (email: string) => {
    return fetchAPI<{
      success: boolean;
      message: string;
    }>('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  /**
   * Yeni şifre belirleme
   */
  resetPassword: async (token: string, newPassword: string) => {
    return fetchAPI<{
      success: boolean;
      message: string;
    }>('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword }),
    });
  },

  /**
   * Mevcut kullanıcı bilgisi
   */
  getMe: async () => {
    return fetchAPI<{
      success: boolean;
      user: {
        id: string;
        email: string;
        name: string | null;
        role: string;
        createdAt: string;
        updatedAt: string;
      };
    }>('/api/auth/me');
  },

  /**
   * Çıkış (sadece localStorage temizler)
   */
  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      removeCookie('token');
    }
  },
};

/**
 * Cookie yardımcı fonksiyonları
 */
const setCookie = (name: string, value: string, days: number = 7) => {
  if (typeof window !== 'undefined') {
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
  }
};

const removeCookie = (name: string) => {
  if (typeof window !== 'undefined') {
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
  }
};

/**
 * Token yönetimi
 */
export const tokenManager = {
  /**
   * Token'ı kaydet (hem localStorage hem cookie)
   */
  setToken: (token: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
      setCookie('token', token, 7); // 7 gün geçerli
    }
  },

  /**
   * Token'ı al
   */
  getToken: (): string | null => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  },

  /**
   * Token'ı sil (hem localStorage hem cookie)
   */
  removeToken: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      removeCookie('token');
    }
  },

  /**
   * Token var mı kontrol et
   */
  hasToken: (): boolean => {
    return !!tokenManager.getToken();
  },
};

/**
 * Kullanıcı yönetimi
 */
export const userManager = {
  /**
   * Kullanıcıyı kaydet
   */
  setUser: (user: any) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(user));
    }
  },

  /**
   * Kullanıcıyı al
   */
  getUser: (): any | null => {
    if (typeof window !== 'undefined') {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    }
    return null;
  },

  /**
   * Kullanıcıyı sil
   */
  removeUser: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user');
    }
  },
};
