import { api } from './client';
import type {
  Supplier,
  CreateSupplierDto,
  UpdateSupplierDto,
  ApiResponse
} from './types';

const BASE_PATH = '/api/suppliers';

/**
 * Tüm tedarikçileri getir
 */
export async function getSuppliers(): Promise<Supplier[]> {
  const response = await api.get<ApiResponse<Supplier[]>>(BASE_PATH);
  return response.data || [];
}

/**
 * ID'ye göre tedarikçi getir
 */
export async function getSupplierById(id: string): Promise<Supplier> {
  const response = await api.get<ApiResponse<Supplier>>(`${BASE_PATH}/${id}`);
  if (!response.data) {
    throw new Error('Tedarikçi bulunamadı');
  }
  return response.data;
}

/**
 * Yeni tedarikçi oluştur
 */
export async function createSupplier(data: CreateSupplierDto): Promise<Supplier> {
  const response = await api.post<ApiResponse<Supplier>>(BASE_PATH, data);
  if (!response.data) {
    throw new Error(response.error || 'Tedarikçi oluşturulamadı');
  }
  return response.data;
}

/**
 * Tedarikçi güncelle
 */
export async function updateSupplier(id: string, data: UpdateSupplierDto): Promise<Supplier> {
  const response = await api.put<ApiResponse<Supplier>>(`${BASE_PATH}/${id}`, data);
  if (!response.data) {
    throw new Error(response.error || 'Tedarikçi güncellenemedi');
  }
  return response.data;
}

/**
 * Tedarikçi sil
 */
export async function deleteSupplier(id: string): Promise<void> {
  const response = await api.delete<ApiResponse>(`${BASE_PATH}/${id}`);
  if (!response.success) {
    throw new Error(response.error || 'Tedarikçi silinemedi');
  }
}
