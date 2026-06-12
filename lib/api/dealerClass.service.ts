/**
 * Dealer Class API Service
 */

import { api } from './client';
import type {
  ApiResponse,
  DealerClass,
  CreateDealerClassDto,
  UpdateDealerClassDto,
  ReorderDealerClassDto,
} from './types';

const BASE_URL = '/api/dealer-classes';

export const dealerClassService = {
  /**
   * Tüm bayi sınıflarını getir
   */
  getAll: async (): Promise<ApiResponse<DealerClass[]>> => {
    return api.get<ApiResponse<DealerClass[]>>(BASE_URL);
  },

  /**
   * ID'ye göre bayi sınıfı getir
   */
  getById: async (id: string): Promise<ApiResponse<DealerClass>> => {
    return api.get<ApiResponse<DealerClass>>(`${BASE_URL}/${id}`);
  },

  /**
   * Yeni bayi sınıfı oluştur
   */
  create: async (data: CreateDealerClassDto): Promise<ApiResponse<DealerClass>> => {
    return api.post<ApiResponse<DealerClass>>(BASE_URL, data);
  },

  /**
   * Bayi sınıfı güncelle
   */
  update: async (id: string, data: UpdateDealerClassDto): Promise<ApiResponse<DealerClass>> => {
    return api.put<ApiResponse<DealerClass>>(`${BASE_URL}/${id}`, data);
  },

  /**
   * Bayi sınıfı sil
   */
  delete: async (id: string): Promise<ApiResponse<void>> => {
    return api.delete<ApiResponse<void>>(`${BASE_URL}/${id}`);
  },

  /**
   * Bayi sınıflarını yeniden sırala
   */
  reorder: async (data: ReorderDealerClassDto): Promise<ApiResponse<void>> => {
    return api.post<ApiResponse<void>>(`${BASE_URL}/reorder`, data);
  },
};
