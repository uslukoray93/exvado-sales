import { api } from './client';
import type { DealerClass, CreateDealerClassDto, UpdateDealerClassDto, ReorderDealerClassDto, ApiResponse } from './types';

const BASE_PATH = '/api/dealer-classes';

/**
 * Get all dealer classes
 */
export async function getDealerClasses(): Promise<DealerClass[]> {
  const response = await api.get<ApiResponse<DealerClass[]>>(BASE_PATH);
  return response.data || [];
}

/**
 * Get dealer class by ID
 */
export async function getDealerClassById(id: string): Promise<DealerClass> {
  const response = await api.get<ApiResponse<DealerClass>>(`${BASE_PATH}/${id}`);
  if (!response.data) {
    throw new Error('Bayi sınıfı bulunamadı');
  }
  return response.data;
}

/**
 * Create new dealer class
 */
export async function createDealerClass(data: CreateDealerClassDto): Promise<DealerClass> {
  const response = await api.post<ApiResponse<DealerClass>>(BASE_PATH, data);
  if (!response.data) {
    throw new Error(response.error || 'Bayi sınıfı oluşturulamadı');
  }
  return response.data;
}

/**
 * Update dealer class
 */
export async function updateDealerClass(id: string, data: UpdateDealerClassDto): Promise<DealerClass> {
  const response = await api.put<ApiResponse<DealerClass>>(`${BASE_PATH}/${id}`, data);
  if (!response.data) {
    throw new Error(response.error || 'Bayi sınıfı güncellenemedi');
  }
  return response.data;
}

/**
 * Delete dealer class
 */
export async function deleteDealerClass(id: string): Promise<void> {
  const response = await api.delete<ApiResponse>(`${BASE_PATH}/${id}`);
  if (!response.success) {
    throw new Error(response.error || 'Bayi sınıfı silinemedi');
  }
}

/**
 * Reorder dealer classes
 */
export async function reorderDealerClasses(data: ReorderDealerClassDto): Promise<void> {
  const response = await api.post<ApiResponse>(`${BASE_PATH}/reorder`, data);
  if (!response.success) {
    throw new Error(response.error || 'Sıralama güncellenemedi');
  }
}
