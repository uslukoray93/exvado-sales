/**
 * Settings API Service
 */

import { api } from './client';
import type { ApiResponse } from './types';

export interface CurrencySettings {
  autoUpdate: boolean;
  interval: number;
  lastSync: string | null;
}

const BASE_PATH = '/api/settings';

export const settingsService = {
  /**
   * Get currency settings
   */
  getCurrencySettings: async (): Promise<CurrencySettings> => {
    const response = await api.get<ApiResponse<CurrencySettings>>(`${BASE_PATH}/currency`);
    if (!response.data) {
      throw new Error('Ayarlar yüklenemedi');
    }
    return response.data;
  },

  /**
   * Update currency settings
   */
  updateCurrencySettings: async (autoUpdate: boolean, interval: number): Promise<CurrencySettings> => {
    const response = await api.put<ApiResponse<CurrencySettings>>(`${BASE_PATH}/currency`, {
      autoUpdate,
      interval
    });
    if (!response.data) {
      throw new Error(response.error || 'Ayarlar güncellenemedi');
    }
    return response.data;
  }
};
