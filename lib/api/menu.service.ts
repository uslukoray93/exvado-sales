import { api } from './client';
import type {
  ApiResponse,
  Menu,
  MenuItem,
  CreateMenuDto,
  UpdateMenuDto,
  CreateMenuItemDto,
  UpdateMenuItemDto,
  ReorderMenuItemsDto,
  MenuLocation,
} from './types';

/**
 * Menu API Service
 * WordPress tarzında menü yönetimi için API servisi
 */
export const menuService = {
  // ============================================
  // MENU İŞLEMLERİ
  // ============================================

  /**
   * Tüm menüleri getir
   */
  getAll: async (): Promise<ApiResponse<Menu[]>> => {
    const response = await api.get<ApiResponse<Menu[]>>('/api/menu');
    return response;
  },

  /**
   * ID ile menü getir
   */
  getById: async (id: string): Promise<ApiResponse<Menu>> => {
    const response = await api.get<ApiResponse<Menu>>(`/api/menu/${id}`);
    return response;
  },

  /**
   * Lokasyona göre menü getir (Frontend için)
   */
  getByLocation: async (location: MenuLocation): Promise<ApiResponse<Menu>> => {
    const response = await api.get<ApiResponse<Menu>>(
      `/api/menu/location/${location.toLowerCase()}`
    );
    return response;
  },

  /**
   * Yeni menü oluştur
   */
  create: async (data: CreateMenuDto): Promise<ApiResponse<Menu>> => {
    const response = await api.post<ApiResponse<Menu>>('/api/menu', data);
    return response;
  },

  /**
   * Menü güncelle
   */
  update: async (
    id: string,
    data: UpdateMenuDto
  ): Promise<ApiResponse<Menu>> => {
    const response = await api.put<ApiResponse<Menu>>(`/api/menu/${id}`, data);
    return response;
  },

  /**
   * Menü sil
   */
  delete: async (id: string): Promise<ApiResponse<void>> => {
    const response = await api.delete<ApiResponse<void>>(`/api/menu/${id}`);
    return response;
  },

  /**
   * Menü durumunu değiştir (aktif/pasif)
   */
  toggleStatus: async (id: string): Promise<ApiResponse<Menu>> => {
    const response = await api.patch<ApiResponse<Menu>>(`/api/menu/${id}/toggle`);
    return response;
  },

  // ============================================
  // MENU ITEM İŞLEMLERİ
  // ============================================

  /**
   * Menü öğesi oluştur
   */
  createItem: async (
    data: CreateMenuItemDto
  ): Promise<ApiResponse<MenuItem>> => {
    const response = await api.post<ApiResponse<MenuItem>>('/api/menu/items', data);
    return response;
  },

  /**
   * Menü öğesi güncelle
   */
  updateItem: async (
    id: string,
    data: UpdateMenuItemDto
  ): Promise<ApiResponse<MenuItem>> => {
    const response = await api.put<ApiResponse<MenuItem>>(
      `/api/menu/items/${id}`,
      data
    );
    return response;
  },

  /**
   * Menü öğesi sil
   */
  deleteItem: async (id: string): Promise<ApiResponse<void>> => {
    const response = await api.delete<ApiResponse<void>>(`/api/menu/items/${id}`);
    return response;
  },

  /**
   * Menü öğesi durumunu değiştir (aktif/pasif)
   */
  toggleItemStatus: async (id: string): Promise<ApiResponse<MenuItem>> => {
    const response = await api.patch<ApiResponse<MenuItem>>(
      `/api/menu/items/${id}/toggle`
    );
    return response;
  },

  /**
   * Menü öğelerini yeniden sırala (Drag & Drop için)
   */
  reorderItems: async (data: ReorderMenuItemsDto): Promise<ApiResponse<void>> => {
    const response = await api.post<ApiResponse<void>>(
      '/api/menu/items/reorder',
      data
    );
    return response;
  },
};
