import { api } from './client';
import type {
  DealerClass,
  CreateDealerClassDto,
  UpdateDealerClassDto,
  ReorderDealerClassDto,
  ApiResponse
} from './types';

const BASE_PATH = '/api/dealer-classes';

/**
 * Tüm bayi sınıflarını getir
 */
export async function getDealerClasses(): Promise<DealerClass[]> {
  const response = await api.get<ApiResponse<DealerClass[]>>(BASE_PATH);
  return response.data || [];
}

/**
 * ID'ye göre bayi sınıfı getir
 */
export async function getDealerClassById(id: string): Promise<DealerClass> {
  const response = await api.get<ApiResponse<DealerClass>>(`${BASE_PATH}/${id}`);
  if (!response.data) {
    throw new Error('Bayi sınıfı bulunamadı');
  }
  return response.data;
}

/**
 * Yeni bayi sınıfı oluştur
 */
export async function createDealerClass(data: CreateDealerClassDto): Promise<DealerClass> {
  const response = await api.post<ApiResponse<DealerClass>>(BASE_PATH, data);
  if (!response.data) {
    throw new Error(response.error || 'Bayi sınıfı oluşturulamadı');
  }
  return response.data;
}

/**
 * Bayi sınıfı güncelle
 */
export async function updateDealerClass(id: string, data: UpdateDealerClassDto): Promise<DealerClass> {
  const response = await api.put<ApiResponse<DealerClass>>(`${BASE_PATH}/${id}`, data);
  if (!response.data) {
    throw new Error(response.error || 'Bayi sınıfı güncellenemedi');
  }
  return response.data;
}

/**
 * Bayi sınıfı sil
 */
export async function deleteDealerClass(id: string): Promise<void> {
  const response = await api.delete<ApiResponse>(`${BASE_PATH}/${id}`);
  if (!response.success) {
    throw new Error(response.error || 'Bayi sınıfı silinemedi');
  }
}

/**
 * Bayi sınıfı sıralamasını güncelle
 */
export async function reorderDealerClasses(data: ReorderDealerClassDto): Promise<void> {
  const response = await api.post<ApiResponse>(`${BASE_PATH}/reorder`, data);
  if (!response.success) {
    throw new Error(response.error || 'Sıralama güncellenemedi');
  }
}
