import { api } from './client';
import type {
  Product,
  CreateProductDto,
  UpdateProductDto,
  UpdateProductStockDto,
  ProductFilters,
  PaginatedResponse,
  ApiResponse,
  ProductImage,
  ReorderImagesDto,
  ProductDealerPrice
} from './types';

const BASE_PATH = '/api/products';

/**
 * Ürünleri filtrelerle getir (paginated)
 */
export async function getProducts(filters?: ProductFilters): Promise<PaginatedResponse<Product>> {
  const params = new URLSearchParams();

  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, String(value));
      }
    });
  }

  const queryString = params.toString();
  const url = queryString ? `${BASE_PATH}?${queryString}` : BASE_PATH;

  return await api.get<PaginatedResponse<Product>>(url);
}

/**
 * ID'ye göre ürün getir
 */
export async function getProductById(id: string): Promise<Product> {
  const response = await api.get<ApiResponse<Product>>(`${BASE_PATH}/${id}`);
  if (!response.data) {
    throw new Error('Ürün bulunamadı');
  }
  return response.data;
}

/**
 * Slug'a göre ürün getir
 */
export async function getProductBySlug(slug: string): Promise<Product> {
  const response = await api.get<ApiResponse<Product>>(`${BASE_PATH}/slug/${slug}`);
  if (!response.data) {
    throw new Error('Ürün bulunamadı');
  }
  return response.data;
}

/**
 * Yeni ürün oluştur
 */
export async function createProduct(data: CreateProductDto): Promise<Product> {
  const response = await api.post<ApiResponse<Product>>(BASE_PATH, data);
  if (!response.data) {
    throw new Error(response.error || 'Ürün oluşturulamadı');
  }
  return response.data;
}

/**
 * Ürün güncelle
 */
export async function updateProduct(id: string, data: UpdateProductDto): Promise<Product> {
  const response = await api.put<ApiResponse<Product>>(`${BASE_PATH}/${id}`, data);
  if (!response.data) {
    throw new Error(response.error || 'Ürün güncellenemedi');
  }
  return response.data;
}

/**
 * Ürün sil
 */
export async function deleteProduct(id: string): Promise<void> {
  const response = await api.delete<ApiResponse>(`${BASE_PATH}/${id}`);
  if (!response.success) {
    throw new Error(response.error || 'Ürün silinemedi');
  }
}

/**
 * Ürün stoğunu güncelle
 */
export async function updateProductStock(id: string, data: UpdateProductStockDto): Promise<Product> {
  const response = await api.patch<ApiResponse<Product>>(`${BASE_PATH}/${id}/stock`, data);
  if (!response.data) {
    throw new Error(response.error || 'Stok güncellenemedi');
  }
  return response.data;
}

/**
 * Ürün durumunu değiştir (aktif/pasif)
 */
export async function toggleProductStatus(id: string): Promise<Product> {
  const response = await api.patch<ApiResponse<Product>>(`${BASE_PATH}/${id}/toggle-status`);
  if (!response.data) {
    throw new Error(response.error || 'Durum değiştirilemedi');
  }
  return response.data;
}

/**
 * Ürün öne çıkarma durumunu değiştir
 */
export async function toggleProductFeatured(id: string): Promise<Product> {
  const response = await api.patch<ApiResponse<Product>>(`${BASE_PATH}/${id}/toggle-featured`);
  if (!response.data) {
    throw new Error(response.error || 'Öne çıkarma değiştirilemedi');
  }
  return response.data;
}

// ============= IMAGE OPERATIONS =============

/**
 * Ürün görseli yükle (tek veya çoklu)
 */
export async function uploadProductImages(
  productId: string,
  files: File[],
  options?: {
    altTexts?: string[];
    mainImageIndex?: number;
  }
): Promise<ProductImage[]> {
  const formData = new FormData();

  files.forEach((file, index) => {
    formData.append('files', file);
    if (options?.altTexts?.[index]) {
      formData.append(`altText_${index}`, options.altTexts[index]);
    }
  });

  if (options?.mainImageIndex !== undefined) {
    formData.append('mainImageIndex', String(options.mainImageIndex));
  }

  const response = await api.upload<ApiResponse<ProductImage[]>>(
    `${BASE_PATH}/${productId}/images`,
    formData
  );

  if (!response.data) {
    throw new Error(response.error || 'Görseller yüklenemedi');
  }

  return response.data;
}

/**
 * Ürün görselini sil
 */
export async function deleteProductImage(productId: string, imageId: string): Promise<void> {
  const response = await api.delete<ApiResponse>(
    `${BASE_PATH}/${productId}/images/${imageId}`
  );
  if (!response.success) {
    throw new Error(response.error || 'Görsel silinemedi');
  }
}

/**
 * Ürün görsellerini yeniden sırala
 */
export async function reorderProductImages(productId: string, data: ReorderImagesDto): Promise<void> {
  const response = await api.post<ApiResponse>(
    `${BASE_PATH}/${productId}/images/reorder`,
    data
  );
  if (!response.success) {
    throw new Error(response.error || 'Görseller yeniden sıralanamadı');
  }
}

/**
 * Ana görseli ayarla
 */
export async function setMainImage(productId: string, imageId: string): Promise<void> {
  const response = await api.patch<ApiResponse>(
    `${BASE_PATH}/${productId}/images/${imageId}/set-main`
  );
  if (!response.success) {
    throw new Error(response.error || 'Ana görsel ayarlanamadı');
  }
}

// ============= DEALER PRICE OPERATIONS =============

/**
 * Ürünün bayi fiyatlarını getir
 */
export async function getProductDealerPrices(productId: string): Promise<ProductDealerPrice[]> {
  const response = await api.get<ApiResponse<ProductDealerPrice[]>>(
    `${BASE_PATH}/${productId}/dealer-prices`
  );
  return response.data || [];
}

/**
 * Ürün için bayi fiyatı ekle veya güncelle
 */
export async function upsertProductDealerPrice(
  productId: string,
  dealerClassId: string,
  price: number,
  discountRate?: number
): Promise<ProductDealerPrice> {
  const response = await api.post<ApiResponse<ProductDealerPrice>>(
    `${BASE_PATH}/${productId}/dealer-prices`,
    { dealerClassId, price, discountRate }
  );

  if (!response.data) {
    throw new Error(response.error || 'Bayi fiyatı kaydedilemedi');
  }

  return response.data;
}

/**
 * Ürün için birden fazla bayi fiyatını toplu güncelle
 */
export async function bulkUpdateDealerPrices(
  productId: string,
  dealerPrices: Array<{
    dealerClassId: string;
    price: number;
    discountRate?: number;
  }>
): Promise<ProductDealerPrice[]> {
  const response = await api.put<ApiResponse<ProductDealerPrice[]>>(
    `${BASE_PATH}/${productId}/dealer-prices/bulk`,
    { dealerPrices }
  );

  if (!response.data) {
    throw new Error(response.error || 'Bayi fiyatları güncellenemedi');
  }

  return response.data;
}

/**
 * Bayi fiyatını sil
 */
export async function deleteProductDealerPrice(
  productId: string,
  dealerClassId: string
): Promise<void> {
  const response = await api.delete<ApiResponse>(
    `${BASE_PATH}/${productId}/dealer-prices/${dealerClassId}`
  );
  if (!response.success) {
    throw new Error(response.error || 'Bayi fiyatı silinemedi');
  }
}

// ============= CATEGORY OPERATIONS =============

/**
 * Ürüne kategori ekle
 */
export async function addProductCategory(
  productId: string,
  categoryId: string,
  isPrimary: boolean = false
): Promise<void> {
  const response = await api.post<ApiResponse>(
    `${BASE_PATH}/${productId}/categories`,
    { categoryId, isPrimary }
  );
  if (!response.success) {
    throw new Error(response.error || 'Kategori eklenemedi');
  }
}

/**
 * Üründen kategori kaldır
 */
export async function removeProductCategory(
  productId: string,
  categoryId: string
): Promise<void> {
  const response = await api.delete<ApiResponse>(
    `${BASE_PATH}/${productId}/categories/${categoryId}`
  );
  if (!response.success) {
    throw new Error(response.error || 'Kategori kaldırılamadı');
  }
}

/**
 * Ürün kategorilerini güncelle (toplu)
 */
export async function updateProductCategories(
  productId: string,
  categoryIds: string[],
  primaryCategoryId?: string
): Promise<void> {
  const response = await api.put<ApiResponse>(
    `${BASE_PATH}/${productId}/categories`,
    { categoryIds, primaryCategoryId }
  );
  if (!response.success) {
    throw new Error(response.error || 'Kategoriler güncellenemedi');
  }
}

// ============= BULK OPERATIONS =============

/**
 * Toplu ürün silme
 */
export async function bulkDeleteProducts(productIds: string[]): Promise<void> {
  const response = await api.post<ApiResponse>(
    `${BASE_PATH}/bulk-delete`,
    { productIds }
  );
  if (!response.success) {
    throw new Error(response.error || 'Ürünler silinemedi');
  }
}

/**
 * Toplu durum değiştirme
 */
export async function bulkToggleStatus(
  productIds: string[],
  isActive: boolean
): Promise<void> {
  const response = await api.post<ApiResponse>(
    `${BASE_PATH}/bulk-toggle-status`,
    { productIds, isActive }
  );
  if (!response.success) {
    throw new Error(response.error || 'Durumlar değiştirilemedi');
  }
}

/**
 * Toplu kategori atama
 */
export async function bulkAssignCategory(
  productIds: string[],
  categoryId: string
): Promise<void> {
  const response = await api.post<ApiResponse>(
    `${BASE_PATH}/bulk-assign-category`,
    { productIds, categoryId }
  );
  if (!response.success) {
    throw new Error(response.error || 'Kategori atanamadı');
  }
}

// ============= GTIN OPERATIONS =============

/**
 * Ürün için GTIN ara
 */
export async function searchProductGTIN(productId: string): Promise<{
  found: boolean;
  gtin?: string;
  productName?: string;
  brand?: string;
  source?: string;
}> {
  const response = await api.post<ApiResponse<{
    found: boolean;
    gtin?: string;
    productName?: string;
    brand?: string;
    source?: string;
  }>>(`${BASE_PATH}/${productId}/gtin/search`, {});

  if (!response.data) {
    throw new Error(response.error || 'GTIN aranamadı');
  }

  return response.data;
}

/**
 * Akıllı GTIN arama (Barcode Lookup + OpenAI)
 */
export async function suggestGTINWithAI(productId: string): Promise<{
  found: boolean;
  gtin: string | null;
  method?: string;
  reasoning?: string;
  isValid?: boolean;
  searchLog?: string[];
  recommendation?: string;
}> {
  const response = await api.post<ApiResponse<{
    found: boolean;
    gtin: string | null;
    method?: string;
    reasoning?: string;
    isValid?: boolean;
    searchLog?: string[];
    recommendation?: string;
  }>>(`${BASE_PATH}/${productId}/suggest-gtin`, {});

  if (!response.data) {
    throw new Error(response.error || 'GTIN araması başarısız oldu');
  }

  return response.data;
}

/**
 * AI ile GTİP kodu önerisi
 */
export async function suggestGTIPWithAI(productId: string): Promise<{
  found: boolean;
  gtipCode: string | null;
  description?: string;
  confidence: number;
  alternatives?: Array<{
    code: string;
    description: string;
    confidence: number;
  }>;
  reasoning?: string;
}> {
  const response = await api.post<ApiResponse<{
    found: boolean;
    gtipCode: string | null;
    description?: string;
    confidence: number;
    alternatives?: Array<{
      code: string;
      description: string;
      confidence: number;
    }>;
    reasoning?: string;
  }>>(`${BASE_PATH}/${productId}/suggest-gtip`, {});

  if (!response.data) {
    throw new Error(response.error || 'GTİP araması başarısız oldu');
  }

  return response.data;
}

/**
 * Benzersiz alanları kontrol et
 */
export async function checkUniqueFields(data: {
  sku?: string;
  barcode?: string;
  gtinCode?: string;
  excludeProductId?: string;
}): Promise<{
  isUnique: boolean;
  conflicts: Array<{
    field: string;
    value: string;
    message: string;
  }>;
}> {
  const response = await api.post<ApiResponse<{
    isUnique: boolean;
    conflicts: Array<{
      field: string;
      value: string;
      message: string;
    }>;
  }>>(`${BASE_PATH}/check-unique`, data);

  if (!response.data) {
    throw new Error(response.error || 'Benzersizlik kontrolü yapılamadı');
  }

  return response.data;
}

// Export all functions as productsApi object
export const productsApi = {
  getProducts,
  getProductById,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
  updateProductStock,
  toggleProductStatus,
  toggleProductFeatured,
  uploadProductImages,
  deleteProductImage,
  reorderProductImages,
  setMainImage,
  getProductDealerPrices,
  upsertProductDealerPrice,
  bulkUpdateDealerPrices,
  deleteProductDealerPrice,
  addProductCategory,
  removeProductCategory,
  updateProductCategories,
  bulkDeleteProducts,
  bulkToggleStatus,
  bulkAssignCategory,
  searchProductGTIN,
  suggestGTINWithAI,
  suggestGTIPWithAI,
  checkUniqueFields,
};
