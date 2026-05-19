/**
 * Product API Service
 */

import { api } from './client';
import type {
  ApiResponse,
  PaginatedResponse,
  Product,
  CreateProductDto,
  UpdateProductDto,
  UpdateProductStockDto,
  ProductFilters,
} from './types';

const BASE_URL = '/api/products';

export const productService = {
  /**
   * Tüm ürünleri getir (filtreleme ve sayfalama ile)
   */
  getAll: async (filters?: ProductFilters): Promise<PaginatedResponse<Product>> => {
    const params = new URLSearchParams();

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });
    }

    const queryString = params.toString();
    const url = queryString ? `${BASE_URL}?${queryString}` : BASE_URL;

    return api.get<PaginatedResponse<Product>>(url);
  },

  /**
   * ID'ye göre ürün getir
   */
  getById: async (id: string): Promise<ApiResponse<Product>> => {
    return api.get<ApiResponse<Product>>(`${BASE_URL}/${id}`);
  },

  /**
   * Yeni ürün oluştur
   */
  create: async (data: CreateProductDto): Promise<ApiResponse<Product>> => {
    return api.post<ApiResponse<Product>>(BASE_URL, data);
  },

  /**
   * Ürün güncelle
   */
  update: async (id: string, data: UpdateProductDto): Promise<ApiResponse<Product>> => {
    return api.put<ApiResponse<Product>>(`${BASE_URL}/${id}`, data);
  },

  /**
   * Ürün sil
   */
  delete: async (id: string): Promise<ApiResponse<void>> => {
    return api.delete<ApiResponse<void>>(`${BASE_URL}/${id}`);
  },

  /**
   * Ürün stok güncelle
   */
  updateStock: async (id: string, data: UpdateProductStockDto): Promise<ApiResponse<Product>> => {
    return api.patch<ApiResponse<Product>>(`${BASE_URL}/${id}/stock`, data);
  },
};
