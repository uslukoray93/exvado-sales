/**
 * Currency API Service
 */

import { api } from './client';
import type { ApiResponse } from './types';

export interface Currency {
  id: string;
  code: string;
  name: string;
  symbol: string;
  rate: number;

  // TCMB Kurları
  buyRate?: number;
  sellRate?: number;

  // Manuel Kur
  manualRate?: number;
  useManualRate: boolean;

  // Değişim Bilgileri
  change?: number;
  changePercent?: number;

  // Senkronizasyon
  lastTcmbSync?: string;

  // Computed fields (from getActiveRates endpoint)
  activeRate?: number;
  rateSource?: 'manual' | 'tcmb';

  isActive: boolean;
  isDefault: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCurrencyDto {
  code: string;
  name: string;
  symbol: string;
  rate: number;
  isActive?: boolean;
  isDefault?: boolean;
  order?: number;
}

export interface UpdateCurrencyDto extends Partial<CreateCurrencyDto> {}

const BASE_PATH = '/api/currencies';

export const currencyService = {
  /**
   * Get all currencies
   */
  getCurrencies: async (isActive?: boolean): Promise<Currency[]> => {
    const query = isActive !== undefined ? `?isActive=${isActive}` : '';
    const response = await api.get<ApiResponse<Currency[]>>(`${BASE_PATH}${query}`);
    return response.data || [];
  },

  /**
   * Get currency by ID
   */
  getCurrencyById: async (id: string): Promise<Currency> => {
    const response = await api.get<ApiResponse<Currency>>(`${BASE_PATH}/${id}`);
    if (!response.data) {
      throw new Error('Döviz bulunamadı');
    }
    return response.data;
  },

  /**
   * Create currency
   */
  createCurrency: async (data: CreateCurrencyDto): Promise<Currency> => {
    const response = await api.post<ApiResponse<Currency>>(BASE_PATH, data);
    if (!response.data) {
      throw new Error(response.error || 'Döviz oluşturulamadı');
    }
    return response.data;
  },

  /**
   * Update currency
   */
  updateCurrency: async (id: string, data: UpdateCurrencyDto): Promise<Currency> => {
    const response = await api.put<ApiResponse<Currency>>(`${BASE_PATH}/${id}`, data);
    if (!response.data) {
      throw new Error(response.error || 'Döviz güncellenemedi');
    }
    return response.data;
  },

  /**
   * Delete currency
   */
  deleteCurrency: async (id: string): Promise<void> => {
    const response = await api.delete<ApiResponse>(`${BASE_PATH}/${id}`);
    if (!response.success) {
      throw new Error(response.error || 'Döviz silinemedi');
    }
  },

  /**
   * Update currency rate
   */
  updateCurrencyRate: async (id: string, rate: number): Promise<Currency> => {
    const response = await api.patch<ApiResponse<Currency>>(`${BASE_PATH}/${id}/rate`, { rate });
    if (!response.data) {
      throw new Error(response.error || 'Döviz kuru güncellenemedi');
    }
    return response.data;
  },

  /**
   * Get active rates (with activeRate and rateSource computed)
   */
  getActiveRates: async (): Promise<Currency[]> => {
    const response = await api.get<ApiResponse<Currency[]>>(`${BASE_PATH}/active-rates`);
    return response.data || [];
  },

  /**
   * Sync currencies from TCMB
   */
  syncFromTCMB: async (): Promise<{ updated: number; created: number; errors: string[] }> => {
    const response = await api.post<ApiResponse<{ updated: number; created: number; errors: string[] }>>(`${BASE_PATH}/sync-tcmb`, {});
    if (!response.data) {
      throw new Error(response.error || 'TCMB kurları senkronize edilemedi');
    }
    return response.data;
  },

  /**
   * Update manual rate
   */
  updateManualRate: async (
    id: string,
    manualRate: number | null,
    useManualRate: boolean,
    buyRate?: number,
    sellRate?: number
  ): Promise<Currency> => {
    const response = await api.patch<ApiResponse<Currency>>(`${BASE_PATH}/${id}/manual-rate`, {
      manualRate,
      useManualRate,
      buyRate,
      sellRate
    });
    if (!response.data) {
      throw new Error(response.error || 'Manuel kur güncellenemedi');
    }
    return response.data;
  }
};
