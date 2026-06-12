import { api } from './client';
import type { ApiResponse } from './types';

const BASE_PATH = '/api/ai-products';

export interface CategoryMatch {
  categoryId: string | null;
  categoryName: string | null;
  confidence: number;
  message?: string;
}

export interface BrandMatch {
  brandId: string | null;
  brandName: string | null;
  confidence: number;
  message?: string;
}

export interface PriceSource {
  url: string;
  price: number;
  currency: string;
  siteName: string;
}

export interface PriceComparison {
  lowestPrice: number;
  highestPrice: number;
  averagePrice: number;
  currency: string;
  priceCount: number;
  sources: PriceSource[];
}

export interface AIProductSuggestion {
  name: string;
  brand?: string;
  brandId?: string;
  brandMatch?: BrandMatch;
  category?: string;
  categoryId?: string;
  categoryMatch?: CategoryMatch;
  description?: string;
  specifications?: Record<string, string>;
  images?: string[];
  estimatedPrice?: number;
  priceComparison?: PriceComparison;
  barcode?: string;
  gtin?: string;
  confidence: number;
  source: string;
}

export interface DownloadedImage {
  id: string;
  imageUrl: string;
  altText: string;
  order: number;
  isMain: boolean;
}

export interface DraftProduct {
  id: string;
  name: string;
  slug: string;
  shortDescription?: string;
  description?: string;
  brandId?: string;
  basePrice: number;
  barcode?: string;
  gtinCode?: string;
  stock: number;
  isDraft: boolean;
  isActive: boolean;
  images?: DownloadedImage[];
  brand?: {
    id: string;
    name: string;
  };
}

/**
 * AI ile ürün ara
 * @param query - Arama sorgusu
 * @param searchType - Arama tipi: 'text' | 'barcode' | 'image'
 */
export async function searchAIProducts(
  query: string,
  searchType: 'text' | 'barcode' | 'image' = 'text'
): Promise<AIProductSuggestion[]> {
  try {
    const response = await api.post<ApiResponse<AIProductSuggestion[]>>(`${BASE_PATH}/search`, {
      query,
      searchType
    });

    if (!response.data) {
      throw new Error(response.error || 'AI arama başarısız');
    }

    return response.data;
  } catch (error: any) {
    console.error('AI product search error:', error);
    throw new Error(error.message || 'Ürün araması yapılırken hata oluştu');
  }
}

/**
 * Görselleri indir ve ürüne kaydet
 * @param imageUrls - İndirilecek görsel URL'leri
 * @param productName - Ürün adı
 * @param productId - Ürün ID'si
 */
export async function downloadProductImages(
  imageUrls: string[],
  productName: string,
  productId: string
): Promise<DownloadedImage[]> {
  try {
    const response = await api.post<ApiResponse<DownloadedImage[]>>(`${BASE_PATH}/download-images`, {
      imageUrls,
      productName,
      productId
    });

    if (!response.data) {
      throw new Error(response.error || 'Görseller indirilemedi');
    }

    return response.data;
  } catch (error: any) {
    console.error('Download images error:', error);
    throw new Error(error.message || 'Görseller indirilirken hata oluştu');
  }
}

/**
 * AI önerisinden taslak ürün oluştur (görsellerle birlikte)
 * @param suggestion - AI ürün önerisi
 */
export async function createDraftFromAI(suggestion: AIProductSuggestion): Promise<DraftProduct> {
  try {
    const response = await api.post<ApiResponse<DraftProduct>>(`${BASE_PATH}/create-draft`, suggestion);

    if (!response.data) {
      throw new Error(response.error || 'Taslak ürün oluşturulamadı');
    }

    return response.data;
  } catch (error: any) {
    console.error('Create draft product error:', error);
    throw new Error(error.message || 'Taslak ürün oluşturulurken hata oluştu');
  }
}

export interface EcommerceProduct {
  title: string;
  url: string;
  source: string;
  snippet?: string;
  images?: string[];  // Birden fazla görsel için array
  price?: number;
  brand?: string;  // Marka
  category?: string;  // Kategori
  description?: string;  // Ürün açıklaması
  specifications?: Record<string, string>;  // Teknik özellikler
  score?: number;  // Ürün kalite puanı (0-10 arası)
}

export interface OptimizedProduct {
  name: string;
  category: {
    id: string | null;
    name: string | null;
    confidence: number;
  } | null;
  brand: {
    id: string | null;
    name: string | null;
    confidence: number;
  } | null;
  description: string;
  specifications: Record<string, string>;
  images: string[];
  price: number;
}

/**
 * E-ticaret sitelerinde ürün ara
 * @param query - Arama sorgusu
 */
export async function searchEcommerceProducts(query: string): Promise<EcommerceProduct[]> {
  try {
    const response = await api.get<ApiResponse<{ query: string; count: number; products: EcommerceProduct[] }>>(
      `${BASE_PATH.replace('/ai-products', '/products')}/search-ecommerce`,
      {
        params: { query }
      }
    );

    if (!response.data) {
      throw new Error(response.error || 'E-ticaret araması başarısız');
    }

    return response.data.products;
  } catch (error: any) {
    console.error('E-commerce product search error:', error);
    throw new Error(error.message || 'Ürün araması yapılırken hata oluştu');
  }
}

/**
 * E-ticaret ürününü AI ile optimize et
 * @param product - E-ticaret ürünü
 */
export async function optimizeEcommerceProduct(product: EcommerceProduct): Promise<OptimizedProduct> {
  try {
    const response = await api.post<ApiResponse<OptimizedProduct>>(`${BASE_PATH}/optimize-ecommerce`, {
      title: product.title,
      images: product.images || [],
      price: product.price || 0,
      brand: product.brand,
      category: product.category,
      description: product.description
    });

    if (!response.data) {
      throw new Error(response.error || 'Ürün optimize edilemedi');
    }

    return response.data;
  } catch (error: any) {
    console.error('Optimize ecommerce product error:', error);
    throw new Error(error.message || 'Ürün optimize edilirken hata oluştu');
  }
}

/**
 * Optimize edilmiş ürünü sisteme ekle
 * @param optimizedProduct - Optimize edilmiş ürün verisi
 */
export async function addProductFromOptimized(optimizedProduct: OptimizedProduct): Promise<{ productId: string; slug: string; name: string }> {
  try {
    const response = await api.post<ApiResponse<{ productId: string; slug: string; name: string }>>(`${BASE_PATH}/add-optimized`, {
      name: optimizedProduct.name,
      categoryId: optimizedProduct.category?.id || null,
      brandId: optimizedProduct.brand?.id || null,
      price: optimizedProduct.price,
      images: optimizedProduct.images,
      specifications: optimizedProduct.specifications
    });

    if (!response.data) {
      throw new Error(response.error || 'Ürün eklenemedi');
    }

    return response.data;
  } catch (error: any) {
    console.error('Add product from optimized error:', error);
    throw new Error(error.message || 'Ürün eklenirken hata oluştu');
  }
}

// Export all functions as aiProductsApi object
export const aiProductsApi = {
  searchAIProducts,
  downloadProductImages,
  createDraftFromAI,
  searchEcommerceProducts,
  optimizeEcommerceProduct,
  addProductFromOptimized
};
