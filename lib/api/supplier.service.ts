/**
 * Supplier API Service
 */

import { api } from './client';
import type {
  ApiResponse,
  Supplier,
  CreateSupplierDto,
  UpdateSupplierDto,
} from './types';

const BASE_URL = '/api/suppliers';

export const supplierService = {
  /**
   * Tüm tedarikçileri getir
   */
  getAll: async (): Promise<ApiResponse<Supplier[]>> => {
    return api.get<ApiResponse<Supplier[]>>(BASE_URL);
  },

  /**
   * ID'ye göre tedarikçi getir
   */
  getById: async (id: string): Promise<ApiResponse<Supplier>> => {
    return api.get<ApiResponse<Supplier>>(`${BASE_URL}/${id}`);
  },

  /**
   * Yeni tedarikçi oluştur
   */
  create: async (data: CreateSupplierDto): Promise<ApiResponse<Supplier>> => {
    return api.post<ApiResponse<Supplier>>(BASE_URL, data);
  },

  /**
   * Tedarikçi güncelle
   */
  update: async (id: string, data: UpdateSupplierDto): Promise<ApiResponse<Supplier>> => {
    return api.put<ApiResponse<Supplier>>(`${BASE_URL}/${id}`, data);
  },

  /**
   * Tedarikçi sil
   */
  delete: async (id: string): Promise<ApiResponse<void>> => {
    return api.delete<ApiResponse<void>>(`${BASE_URL}/${id}`);
  },
};
