import { api } from './client';
import type {
  VariantOption,
  CreateVariantOptionDto,
  UpdateVariantOptionDto,
  ApiResponse
} from './types';

const BASE_PATH = '/api/variant-options';

/**
 * Tüm varyant seçeneklerini getir
 */
export async function getVariantOptions(): Promise<VariantOption[]> {
  const response = await api.get<ApiResponse<VariantOption[]>>(BASE_PATH);
  return response.data || [];
}

/**
 * ID'ye göre varyant seçeneği getir
 */
export async function getVariantOptionById(id: string): Promise<VariantOption> {
  const response = await api.get<ApiResponse<VariantOption>>(`${BASE_PATH}/${id}`);
  if (!response.data) {
    throw new Error('Varyant seçeneği bulunamadı');
  }
  return response.data;
}

/**
 * Yeni varyant seçeneği oluştur
 */
export async function createVariantOption(data: CreateVariantOptionDto): Promise<VariantOption> {
  const response = await api.post<ApiResponse<VariantOption>>(BASE_PATH, data);
  if (!response.data) {
    throw new Error(response.error || 'Varyant seçeneği oluşturulamadı');
  }
  return response.data;
}

/**
 * Varyant seçeneği güncelle
 */
export async function updateVariantOption(id: string, data: UpdateVariantOptionDto): Promise<VariantOption> {
  const response = await api.put<ApiResponse<VariantOption>>(`${BASE_PATH}/${id}`, data);
  if (!response.data) {
    throw new Error(response.error || 'Varyant seçeneği güncellenemedi');
  }
  return response.data;
}

/**
 * Varyant seçeneği sil
 */
export async function deleteVariantOption(id: string): Promise<void> {
  const response = await api.delete<ApiResponse>(`${BASE_PATH}/${id}`);
  if (!response.success) {
    throw new Error(response.error || 'Varyant seçeneği silinemedi');
  }
}
