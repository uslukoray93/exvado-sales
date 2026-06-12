/**
 * Slider API Service
 */

import { api } from './client';
import type {
  ApiResponse,
  Slider,
  CreateSliderDto,
  UpdateSliderDto,
  ReorderSliderDto,
} from './types';

const BASE_URL = '/api/sliders';

export const sliderService = {
  /**
   * Tüm sliderları getir
   */
  getAll: async (): Promise<ApiResponse<Slider[]>> => {
    return api.get<ApiResponse<Slider[]>>(BASE_URL);
  },

  /**
   * ID'ye göre slider getir
   */
  getById: async (id: string): Promise<ApiResponse<Slider>> => {
    return api.get<ApiResponse<Slider>>(`${BASE_URL}/${id}`);
  },

  /**
   * Yeni slider oluştur
   */
  create: async (data: CreateSliderDto): Promise<ApiResponse<Slider>> => {
    return api.post<ApiResponse<Slider>>(BASE_URL, data);
  },

  /**
   * Slider güncelle
   */
  update: async (id: string, data: UpdateSliderDto): Promise<ApiResponse<Slider>> => {
    return api.put<ApiResponse<Slider>>(`${BASE_URL}/${id}`, data);
  },

  /**
   * Slider sil
   */
  delete: async (id: string): Promise<ApiResponse<void>> => {
    return api.delete<ApiResponse<void>>(`${BASE_URL}/${id}`);
  },

  /**
   * Sliderları yeniden sırala
   */
  reorder: async (data: ReorderSliderDto): Promise<ApiResponse<void>> => {
    return api.post<ApiResponse<void>>(`${BASE_URL}/reorder`, data);
  },

  /**
   * Slider durumunu değiştir (aktif/pasif)
   */
  toggleStatus: async (id: string): Promise<ApiResponse<Slider>> => {
    return api.patch<ApiResponse<Slider>>(`${BASE_URL}/${id}/toggle-status`);
  },

  /**
   * Slider'ı yukarı veya aşağı taşı
   */
  moveSlide: async (id: string, direction: 'up' | 'down'): Promise<ApiResponse<Slider[]>> => {
    return api.patch<ApiResponse<Slider[]>>(`${BASE_URL}/${id}/move`, { direction });
  },

  /**
   * Toplu sıralama güncelle
   */
  bulkReorder: async (sliders: { id: string; order: number }[]): Promise<ApiResponse<Slider[]>> => {
    return api.post<ApiResponse<Slider[]>>(`${BASE_URL}/bulk-reorder`, { sliders });
  },
};
