/**
 * Upload API Service
 */

import { api } from './client';
import type {
  UploadResponse,
  ReorderImagesDto,
  ApiResponse,
} from './types';

const BASE_URL = '/api/upload';

export const uploadService = {
  /**
   * Tek görsel yükle
   */
  uploadSingleImage: async (
    file: File,
    uploadType: 'product' | 'brand' | 'category' | 'temp' = 'temp',
    onProgress?: (progress: number) => void
  ): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('uploadType', uploadType);

    return api.upload<UploadResponse>(`${BASE_URL}/image`, formData, onProgress);
  },

  /**
   * Çoklu görsel yükle
   */
  uploadMultipleImages: async (
    files: File[],
    uploadType: 'product' | 'brand' | 'category' | 'temp' = 'temp',
    onProgress?: (progress: number) => void
  ): Promise<UploadResponse> => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('images', file);
    });
    formData.append('uploadType', uploadType);

    return api.upload<UploadResponse>(`${BASE_URL}/images`, formData, onProgress);
  },

  /**
   * Görsel yükle ve optimize et
   */
  uploadAndOptimize: async (
    file: File,
    quality: number = 80,
    uploadType: 'product' | 'brand' | 'category' | 'temp' = 'temp',
    onProgress?: (progress: number) => void
  ): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('uploadType', uploadType);
    formData.append('quality', String(quality));

    return api.upload<UploadResponse>(`${BASE_URL}/optimize`, formData, onProgress);
  },

  /**
   * Thumbnails ile görsel yükle
   */
  uploadWithThumbnails: async (
    file: File,
    uploadType: 'product' | 'brand' | 'category' | 'temp' = 'temp',
    onProgress?: (progress: number) => void
  ): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('uploadType', uploadType);

    return api.upload<UploadResponse>(`${BASE_URL}/thumbnails`, formData, onProgress);
  },

  /**
   * Ürüne görsel ekle
   */
  addProductImages: async (
    productId: string,
    files: File[],
    altText?: string,
    onProgress?: (progress: number) => void
  ): Promise<UploadResponse> => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('images', file);
    });
    if (altText) {
      formData.append('altText', altText);
    }

    return api.upload<UploadResponse>(
      `${BASE_URL}/product/${productId}/images`,
      formData,
      onProgress
    );
  },

  /**
   * Ürün görselini sil
   */
  deleteProductImage: async (imageId: string): Promise<ApiResponse<void>> => {
    return api.delete<ApiResponse<void>>(`${BASE_URL}/product/image/${imageId}`);
  },

  /**
   * Ürün görsellerini yeniden sırala
   */
  reorderProductImages: async (productId: string, data: ReorderImagesDto): Promise<ApiResponse<void>> => {
    return api.post<ApiResponse<void>>(`${BASE_URL}/product/${productId}/reorder`, data);
  },
};
