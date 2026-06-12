/**
 * Slider Settings API Service
 */

import { api } from './client';
import type {
  ApiResponse,
  SliderSettings,
  UpdateSliderSettingsDto,
} from './types';

const BASE_URL = '/api/slider-settings';

export const sliderSettingsService = {
  /**
   * Slider ayarlarını getir
   */
  getSettings: async (): Promise<ApiResponse<SliderSettings>> => {
    return api.get<ApiResponse<SliderSettings>>(BASE_URL);
  },

  /**
   * Slider ayarlarını güncelle
   */
  updateSettings: async (data: UpdateSliderSettingsDto): Promise<ApiResponse<SliderSettings>> => {
    return api.put<ApiResponse<SliderSettings>>(BASE_URL, data);
  },
};
