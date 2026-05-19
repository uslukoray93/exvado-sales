/**
 * Brand API Service
 */

import { api } from './client';
import type {
  ApiResponse,
  Brand,
  CreateBrandDto,
  UpdateBrandDto,
  ReorderBrandDto,
} from './types';

const BASE_URL = '/api/brands';

export const brandService = {
  /**
   * Tüm markaları getir
   */
  getAll: async (): Promise<ApiResponse<Brand[]>> => {
    return api.get<ApiResponse<Brand[]>>(BASE_URL);
  },

  /**
   * ID'ye göre marka getir
   */
  getById: async (id: string): Promise<ApiResponse<Brand>> => {
    return api.get<ApiResponse<Brand>>(`${BASE_URL}/${id}`);
  },

  /**
   * Yeni marka oluştur
   */
  create: async (data: CreateBrandDto): Promise<ApiResponse<Brand>> => {
    return api.post<ApiResponse<Brand>>(BASE_URL, data);
  },

  /**
   * Marka güncelle
   */
  update: async (id: string, data: UpdateBrandDto): Promise<ApiResponse<Brand>> => {
    return api.put<ApiResponse<Brand>>(`${BASE_URL}/${id}`, data);
  },

  /**
   * Marka sil
   */
  delete: async (id: string): Promise<ApiResponse<void>> => {
    return api.delete<ApiResponse<void>>(`${BASE_URL}/${id}`);
  },

  /**
   * Markaları yeniden sırala
   */
  reorder: async (data: ReorderBrandDto): Promise<ApiResponse<void>> => {
    return api.post<ApiResponse<void>>(`${BASE_URL}/reorder`, data);
  },
};
