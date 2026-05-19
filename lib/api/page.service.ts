/**
 * Page API Service
 */

import { api } from './client';
import type {
  ApiResponse,
  Page,
  CreatePageDto,
  UpdatePageDto,
  PageFilters,
} from './types';

const BASE_URL = '/api/pages';

export const pageService = {
  /**
   * Tüm sayfaları getir (filtreleme ile)
   */
  getAll: async (filters?: PageFilters): Promise<ApiResponse<Page[]>> => {
    const params = new URLSearchParams();

    if (filters?.type) {
      params.append('type', filters.type);
    }
    if (filters?.status) {
      params.append('status', filters.status);
    }
    if (filters?.isActive !== undefined) {
      params.append('isActive', String(filters.isActive));
    }

    const url = params.toString() ? `${BASE_URL}?${params.toString()}` : BASE_URL;
    return api.get<ApiResponse<Page[]>>(url);
  },

  /**
   * ID'ye göre sayfa getir
   */
  getById: async (id: string): Promise<ApiResponse<Page>> => {
    return api.get<ApiResponse<Page>>(`${BASE_URL}/${id}`);
  },

  /**
   * Slug'a göre sayfa getir (public access)
   */
  getBySlug: async (slug: string): Promise<ApiResponse<Page>> => {
    return api.get<ApiResponse<Page>>(`${BASE_URL}/slug/${slug}`);
  },

  /**
   * Yeni sayfa oluştur
   */
  create: async (data: CreatePageDto): Promise<ApiResponse<Page>> => {
    return api.post<ApiResponse<Page>>(BASE_URL, data);
  },

  /**
   * Sayfa güncelle
   */
  update: async (id: string, data: UpdatePageDto): Promise<ApiResponse<Page>> => {
    return api.put<ApiResponse<Page>>(`${BASE_URL}/${id}`, data);
  },

  /**
   * Sayfa sil
   */
  delete: async (id: string): Promise<ApiResponse<void>> => {
    return api.delete<ApiResponse<void>>(`${BASE_URL}/${id}`);
  },

  /**
   * Sayfa durumunu değiştir (aktif/pasif)
   */
  toggleStatus: async (id: string): Promise<ApiResponse<Page>> => {
    return api.patch<ApiResponse<Page>>(`${BASE_URL}/${id}/toggle`);
  },

  /**
   * Sayfa yayın durumunu değiştir (DRAFT/PUBLISHED/ARCHIVED)
   */
  updateStatus: async (id: string, status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'): Promise<ApiResponse<Page>> => {
    return api.patch<ApiResponse<Page>>(`${BASE_URL}/${id}/status`, { status });
  },
};
