import { api } from './client';
import type {
  Brand,
  CreateBrandDto,
  UpdateBrandDto,
  ReorderBrandDto,
  ApiResponse
} from './types';

const BASE_PATH = '/api/brands';

/**
 * Tüm markaları getir
 */
export async function getBrands(): Promise<Brand[]> {
  const response = await api.get<ApiResponse<Brand[]>>(BASE_PATH);
  return response.data || [];
}

/**
 * ID'ye göre marka getir
 */
export async function getBrandById(id: string): Promise<Brand> {
  const response = await api.get<ApiResponse<Brand>>(`${BASE_PATH}/${id}`);
  if (!response.data) {
    throw new Error('Marka bulunamadı');
  }
  return response.data;
}

/**
 * Yeni marka oluştur
 */
export async function createBrand(data: CreateBrandDto): Promise<Brand> {
  const response = await api.post<ApiResponse<Brand>>(BASE_PATH, data);
  if (!response.data) {
    throw new Error(response.error || 'Marka oluşturulamadı');
  }
  return response.data;
}

/**
 * Marka güncelle
 */
export async function updateBrand(id: string, data: UpdateBrandDto): Promise<Brand> {
  const response = await api.put<ApiResponse<Brand>>(`${BASE_PATH}/${id}`, data);
  if (!response.data) {
    throw new Error(response.error || 'Marka güncellenemedi');
  }
  return response.data;
}

/**
 * Marka sil
 */
export async function deleteBrand(id: string): Promise<void> {
  const response = await api.delete<ApiResponse>(`${BASE_PATH}/${id}`);
  if (!response.success) {
    throw new Error(response.error || 'Marka silinemedi');
  }
}

/**
 * Marka sıralamasını güncelle
 */
export async function reorderBrands(data: ReorderBrandDto): Promise<void> {
  const response = await api.post<ApiResponse>(`${BASE_PATH}/reorder`, data);
  if (!response.success) {
    throw new Error(response.error || 'Sıralama güncellenemedi');
  }
}

/**
 * Logo yükle
 */
export async function uploadBrandLogo(file: File, title?: string, altText?: string): Promise<{
  filename: string
  url: string
  altText?: string
  title?: string
}> {
  const formData = new FormData();
  formData.append('file', file);

  const params = new URLSearchParams({
    uploadType: 'brands'
  });

  if (title) params.append('title', title);
  if (altText) params.append('altText', altText);

  const response = await api.upload<ApiResponse<{
    filename: string
    url: string
    altText?: string
    title?: string
  }>>(`/api/upload/image?${params.toString()}`, formData);

  if (!response.data) {
    throw new Error(response.error || 'Logo yüklenemedi');
  }

  return response.data;
}
