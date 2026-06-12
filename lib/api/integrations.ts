import apiClient from './client';

/**
 * Integration API Client
 *
 * Entegrasyon işlemleri için API fonksiyonları
 */

export interface Integration {
  id: string;
  name: string;
  displayName: string;
  category: string;
  description?: string;
  isActive: boolean;
  apiKey?: string | null; // Masked on frontend
  apiSecret?: string | null; // Masked on frontend
  endpoint?: string | null;
  config?: any;
  totalRequests: number;
  successRequests: number;
  failedRequests: number;
  lastTestedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateIntegrationDto {
  displayName: string;
  category: string;
  description?: string;
  isActive?: boolean;
  apiKey?: string;
  apiSecret?: string;
  endpoint?: string;
  config?: any;
}

export interface UpdateIntegrationDto {
  displayName?: string;
  category?: string;
  description?: string;
  isActive?: boolean;
  apiKey?: string;
  apiSecret?: string;
  endpoint?: string;
  config?: any;
}

export interface TestIntegrationResult {
  success: boolean;
  message: string;
  data?: any;
}

/**
 * Tüm entegrasyonları getir
 */
export async function getAllIntegrations(): Promise<Integration[]> {
  const response = await apiClient.get<{ success: boolean; data: Integration[] }>(
    '/api/integrations'
  );
  return response.data.data;
}

/**
 * Kategoriye göre entegrasyonları getir
 */
export async function getIntegrationsByCategory(category: string): Promise<Integration[]> {
  const response = await apiClient.get<{ success: boolean; data: Integration[] }>(
    `/api/integrations/category/${category}`
  );
  return response.data.data;
}

/**
 * İsme göre entegrasyon getir
 */
export async function getIntegrationByName(name: string): Promise<Integration> {
  const response = await apiClient.get<{ success: boolean; data: Integration }>(
    `/api/integrations/${name}`
  );
  return response.data.data;
}

/**
 * Entegrasyon oluştur veya güncelle
 */
export async function createOrUpdateIntegration(
  name: string,
  data: CreateIntegrationDto
): Promise<Integration> {
  const response = await apiClient.post<{ success: boolean; data: Integration }>(
    `/api/integrations/${name}`,
    data
  );
  return response.data.data;
}

/**
 * Entegrasyonu güncelle
 */
export async function updateIntegration(
  name: string,
  data: UpdateIntegrationDto
): Promise<Integration> {
  const response = await apiClient.put<{ success: boolean; data: Integration }>(
    `/api/integrations/${name}`,
    data
  );
  return response.data.data;
}

/**
 * Entegrasyonu sil
 */
export async function deleteIntegration(name: string): Promise<void> {
  await apiClient.delete(`/api/integrations/${name}`);
}

/**
 * Entegrasyon bağlantısını test et
 */
export async function testIntegration(name: string): Promise<TestIntegrationResult> {
  const response = await apiClient.post<TestIntegrationResult>(
    `/api/integrations/${name}/test`
  );
  return response.data;
}

// Specific integration helpers

/**
 * Barcode Lookup entegrasyonunu getir (decrypt edilmiş API key ile)
 */
export async function getBarcodeLookupIntegration(): Promise<Integration | null> {
  try {
    const response = await apiClient.get<{ success: boolean; data: Integration }>(
      `/api/integrations/barcode_lookup/decrypt`
    );
    return response.data.data;
  } catch (error) {
    return null;
  }
}

/**
 * Barcode Lookup entegrasyonunu kaydet
 */
export async function saveBarcodeLookupIntegration(data: {
  apiKey?: string;
  isActive: boolean;
  endpoint?: string;
}): Promise<Integration> {
  const payload: any = {
    displayName: 'Barcode Lookup',
    category: 'optimization',
    description: 'GTIN/Barkod doğrulama ve ürün bilgisi alma servisi',
    isActive: data.isActive,
    endpoint: data.endpoint || 'https://api.barcodelookup.com/v3/products',
  };

  // API key'i sadece gönderildiyse ekle
  if (data.apiKey) {
    payload.apiKey = data.apiKey;
  }

  return await createOrUpdateIntegration('barcode_lookup', payload);
}

/**
 * Barcode Lookup bağlantısını test et
 */
export async function testBarcodeLookup(): Promise<TestIntegrationResult> {
  return await testIntegration('barcode_lookup');
}

/**
 * OpenAI entegrasyonunu getir (API key decrypt edilmiş olarak)
 */
export async function getOpenAIIntegration(): Promise<Integration | null> {
  try {
    const response = await apiClient.get<{ success: boolean; data: Integration }>(
      `/api/integrations/openai/decrypt`
    );
    return response.data.data;
  } catch (error) {
    return null;
  }
}

/**
 * OpenAI entegrasyonunu kaydet
 */
export async function saveOpenAIIntegration(data: {
  apiKey?: string;
  isActive: boolean;
  model?: string;
}): Promise<Integration> {
  const payload: any = {
    displayName: 'OpenAI GPT',
    category: 'optimization',
    description: 'GTİP otomatik tespit, ürün açıklaması yazma ve AI özellikleri',
    isActive: data.isActive,
  };

  // API key'i sadece gerçekten doluysa ekle (boş string gönderme)
  if (data.apiKey && data.apiKey.trim() !== '') {
    payload.apiKey = data.apiKey;
  }

  // Model seçimini config'e kaydet
  if (data.model) {
    payload.config = { model: data.model };
  }

  return await createOrUpdateIntegration('openai', payload);
}

/**
 * OpenAI bağlantısını test et
 */
export async function testOpenAI(): Promise<TestIntegrationResult> {
  return await testIntegration('openai');
}
