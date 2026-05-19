import { api } from './client';
import type {
  ProductVariant,
  CreateVariantDto,
  UpdateVariantDto,
  GenerateVariantsDto,
  BulkUpdateVariantsDto,
  ApiResponse
} from './types';

/**
 * Ürüne ait tüm varyantları getir
 */
export async function getProductVariants(productId: string): Promise<ProductVariant[]> {
  const response = await api.get<ApiResponse<ProductVariant[]>>(`/api/products/${productId}/variants`);
  return response.data || [];
}

/**
 * ID'ye göre varyant getir
 */
export async function getVariantById(productId: string, variantId: string): Promise<ProductVariant> {
  const response = await api.get<ApiResponse<ProductVariant>>(`/api/products/${productId}/variants/${variantId}`);
  if (!response.data) {
    throw new Error('Varyant bulunamadı');
  }
  return response.data;
}

/**
 * Otomatik varyant oluştur (kombinasyonlar)
 */
export async function generateVariants(productId: string, data: GenerateVariantsDto): Promise<ProductVariant[]> {
  const response = await api.post<ApiResponse<ProductVariant[]>>(`/api/products/${productId}/variants/generate`, data);
  if (!response.data) {
    throw new Error(response.error || 'Varyantlar oluşturulamadı');
  }
  return response.data;
}

/**
 * Tek varyant oluştur (manuel)
 */
export async function createVariant(productId: string, data: CreateVariantDto): Promise<ProductVariant> {
  const response = await api.post<ApiResponse<ProductVariant>>(`/api/products/${productId}/variants`, data);
  if (!response.data) {
    throw new Error(response.error || 'Varyant oluşturulamadı');
  }
  return response.data;
}

/**
 * Varyant güncelle
 */
export async function updateVariant(productId: string, variantId: string, data: UpdateVariantDto): Promise<ProductVariant> {
  const response = await api.put<ApiResponse<ProductVariant>>(`/api/products/${productId}/variants/${variantId}`, data);
  if (!response.data) {
    throw new Error(response.error || 'Varyant güncellenemedi');
  }
  return response.data;
}

/**
 * Varyant sil
 */
export async function deleteVariant(productId: string, variantId: string): Promise<void> {
  const response = await api.delete<ApiResponse>(`/api/products/${productId}/variants/${variantId}`);
  if (!response.success) {
    throw new Error(response.error || 'Varyant silinemedi');
  }
}

/**
 * Toplu varyant güncelleme
 */
export async function bulkUpdateVariants(productId: string, data: BulkUpdateVariantsDto): Promise<void> {
  const response = await api.patch<ApiResponse>(`/api/products/${productId}/variants/bulk`, data);
  if (!response.success) {
    throw new Error(response.error || 'Varyantlar toplu güncellenemedi');
  }
}
