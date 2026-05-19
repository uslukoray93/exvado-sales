/**
 * Backend API Type Definitions
 * Backend Prisma modelleriyle tam uyumlu tipler
 */

// ============= BASE TYPES =============

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ============= CATEGORY TYPES =============

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  imageTitle: string | null;
  imageAlt: string | null;
  icon: string | null;
  color: string | null;
  parentId: string | null;
  isActive: boolean;
  showInMenu: boolean;
  showInHome: boolean;
  order: number;
  // SEO
  metaTitle: string | null;
  metaDescription: string | null;
  metaKeywords: string | null;
  ogImage: string | null;
  ogTitle: string | null;
  ogDescription: string | null;
  twitterTitle: string | null;
  twitterDescription: string | null;
  createdAt: string;
  updatedAt: string;
  // Relations
  parent?: Category | null;
  children?: Category[];
  products?: Product[];
  _count?: {
    products: number;
    children: number;
  };
}

export interface CategoryTree extends Category {
  children: CategoryTree[];
}

export interface CreateCategoryDto {
  name: string;
  description?: string;
  imageUrl?: string;
  imageTitle?: string;
  imageAlt?: string;
  icon?: string;
  color?: string;
  parentId?: string;
  order?: number;
  isActive?: boolean;
  showInMenu?: boolean;
  showInHome?: boolean;
  // SEO
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  ogImage?: string;
  ogTitle?: string;
  ogDescription?: string;
  twitterTitle?: string;
  twitterDescription?: string;
}

export interface UpdateCategoryDto extends Partial<CreateCategoryDto> {}

export interface ReorderCategoryDto {
  categories: { id: string; order: number }[];
}

// ============= BRAND TYPES =============

export interface Brand {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo: string | null;
  logoTitle: string | null;
  logoAlt: string | null;
  order: number;
  isActive: boolean;
  // SEO
  metaTitle: string | null;
  metaDescription: string | null;
  metaKeywords: string | null;
  ogImage: string | null;
  // Social Media
  ogTitle: string | null;
  ogDescription: string | null;
  twitterTitle: string | null;
  twitterDescription: string | null;
  createdAt: string;
  updatedAt: string;
  // Relations
  products?: Product[];
  _count?: {
    products: number;
  };
}

export interface CreateBrandDto {
  name: string;
  slug?: string;
  description?: string;
  logo?: string;
  logoTitle?: string;
  logoAlt?: string;
  order?: number;
  isActive?: boolean;
  // SEO
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  ogImage?: string;
  // Social Media
  ogTitle?: string;
  ogDescription?: string;
  twitterTitle?: string;
  twitterDescription?: string;
}

export interface UpdateBrandDto extends Partial<CreateBrandDto> {}

export interface ReorderBrandDto {
  brands: { id: string; order: number }[];
}

// ============= SUPPLIER TYPES =============

export interface Supplier {
  id: string;
  name: string;
  contactName: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  taxNumber: string | null;
  taxOffice: string | null;
  paymentTerms: string | null;
  notes: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  // Relations
  products?: Product[];
  _count?: {
    products: number;
  };
}

export interface CreateSupplierDto {
  name: string;
  contactName?: string;
  email?: string;
  phone?: string;
  address?: string;
  taxNumber?: string;
  taxOffice?: string;
  paymentTerms?: string;
  notes?: string;
  isActive?: boolean;
}

export interface UpdateSupplierDto extends Partial<CreateSupplierDto> {}

// ============= DEALER CLASS TYPES =============

export interface DealerClass {
  id: string;
  name: string;
  description: string | null;
  discountRate: number;
  minOrderAmount: number | null;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  // Relations
  dealerClassPrices?: DealerClassPrice[];
  _count?: {
    dealerClassPrices: number;
  };
}

export interface CreateDealerClassDto {
  name: string;
  description?: string;
  discountRate?: number;
  minOrderAmount?: number | null;
  order?: number;
  isActive?: boolean;
}

export interface UpdateDealerClassDto extends Partial<CreateDealerClassDto> {}

export interface ReorderDealerClassDto {
  dealerClasses: { id: string; order: number }[];
}

// ============= DEALER CLASS PRICE TYPES =============

export interface DealerClassPrice {
  id: string;
  dealerClassId: string;
  productId: string;
  price: number;
  createdAt: string;
  updatedAt: string;
  // Relations
  dealerClass?: DealerClass;
  product?: Product;
}

// ============= PRODUCT IMAGE TYPES =============

export interface ProductImage {
  id: string;
  productId: string;
  imageUrl: string;
  altText: string | null;
  order: number;
  isMain: boolean;
  createdAt: string;
  updatedAt: string;
}

// ============= PRODUCT CATEGORY (MANY-TO-MANY) =============

export interface ProductCategory {
  productId: string;
  categoryId: string;
  isPrimary: boolean;
  // Relations
  product?: Product;
  category?: Category;
}

// ============= PRODUCT DEALER PRICE TYPES =============

export interface ProductDealerPrice {
  id: string;
  productId: string;
  dealerClassId: string;
  price: number;
  discountRate: number | null;
  createdAt: string;
  updatedAt: string;
  // Relations
  product?: Product;
  dealerClass?: DealerClass;
}

// ============= PRODUCT TYPES =============

export enum StockStatus {
  IN_STOCK = 'IN_STOCK',
  OUT_OF_STOCK = 'OUT_OF_STOCK',
  LOW_STOCK = 'LOW_STOCK',
}

export interface Product {
  id: string;
  autoIncrementId: number;
  name: string;
  slug: string;
  shortDescription: string | null;
  description: string | null;
  sku: string;
  barcode: string | null;
  gtinCode: string | null;
  gtipCode: string | null;
  identifierExists: boolean;
  gtinSource: string | null;
  basePrice: number;
  costPrice: number | null;
  discountRate: number;
  discountedPrice: number | null;
  transferDiscountRate: number;
  taxRate: number;
  profitMargin: number | null;
  stock: number;
  minStock: number;
  maxStock: number | null;
  stockStatus: StockStatus;
  featuredImage: string | null;
  videoUrl: string | null;
  isActive: boolean;
  isFeatured: boolean;
  showInCategory: boolean;
  showInShowcase: boolean;
  showInBrandPage: boolean;
  isTagFeatured: boolean;
  brandId: string | null;
  supplierId: string | null;
  warrantyPeriod: number | null;
  // Teslimat ve Lojistik
  deliveryTime: number | null;
  width: number | null;
  height: number | null;
  length: number | null;
  desi: number | null;
  // Ödeme Seçenekleri
  installmentEnabled: boolean;
  // SEO
  metaTitle: string | null;
  metaDescription: string | null;
  metaKeywords: string | null;
  canonicalUrl: string | null;
  ogTitle: string | null;
  ogDescription: string | null;
  ogImage: string | null;
  twitterCard: string | null;
  twitterTitle: string | null;
  twitterDescription: string | null;
  twitterImage: string | null;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  // Relations
  brand?: Brand | null;
  supplier?: Supplier | null;
  categories?: ProductCategory[];
  images?: ProductImage[];
  dealerPrices?: ProductDealerPrice[];
  _count?: {
    categories: number;
    images: number;
    dealerPrices: number;
  };
}

export interface CreateProductDto {
  name: string;
  shortDescription?: string;
  description?: string;
  sku?: string;
  barcode?: string;
  gtinCode?: string;
  gtipCode?: string;
  identifierExists?: boolean;
  gtinSource?: string;
  basePrice: number;
  costPrice?: number;
  discountRate?: number;
  discountedPrice?: number;
  transferDiscountRate?: number;
  taxRate?: number;
  profitMargin?: number;
  stock: number;
  minStock?: number;
  maxStock?: number;
  featuredImage?: string;
  videoUrl?: string;
  isActive?: boolean;
  isFeatured?: boolean;
  brandId?: string;
  supplierId?: string;
  warrantyPeriod?: number;
  // Teslimat ve Lojistik
  deliveryTime?: number;
  width?: number;
  height?: number;
  length?: number;
  // Ödeme Seçenekleri
  installmentEnabled?: boolean;
  categoryIds?: string[];
  // SEO
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  canonicalUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  twitterCard?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  // Dealer prices
  dealerPrices?: {
    dealerClassId: string;
    price: number;
  }[];
}

export interface UpdateProductDto extends Partial<CreateProductDto> {}

export interface UpdateProductStockDto {
  stock: number;
}

export interface ProductFilters {
  page?: number;
  limit?: number;
  search?: string;
  brandId?: string;
  supplierId?: string;
  categoryId?: string;
  stockStatus?: StockStatus;
  isActive?: boolean;
  isFeatured?: boolean;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'createdAt' | 'name' | 'basePrice' | 'stock';
  sortOrder?: 'asc' | 'desc';
}

// ============= UPLOAD TYPES =============

export interface UploadedFile {
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
  path: string;
  url: string;
}

export interface ThumbnailUrls {
  original: string;
  large: string;
  medium: string;
  small: string;
  thumbnail: string;
}

export interface UploadResponse {
  success: boolean;
  message: string;
  data: UploadedFile | UploadedFile[] | ThumbnailUrls | ProductImage[];
}

export interface ReorderImagesDto {
  images: { id: string; order: number; isMain?: boolean }[];
}

// ============= AUTH TYPES =============

export interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: User;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  name?: string;
}

export interface ForgotPasswordDto {
  email: string;
}

export interface ResetPasswordDto {
  token: string;
  newPassword: string;
}

// ============= VARIANT TYPES =============

export interface VariantOption {
  id: string;
  name: string; // "Renk", "Beden", "Materyal"
  type: 'STANDARD' | 'CUSTOM';
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateVariantOptionDto {
  name: string;
  type?: 'STANDARD' | 'CUSTOM';
  order?: number;
}

export interface UpdateVariantOptionDto extends Partial<CreateVariantOptionDto> {}

// Variant Image
export interface VariantImage {
  id: string;
  variantId: string;
  imageUrl: string;
  altText: string | null;
  title: string | null;
  order: number;
  isMain: boolean;
  createdAt: string;
}

// Variant Dealer Price
export interface VariantDealerPrice {
  id: string;
  variantId: string;
  dealerClassId: string;
  price: number;
  discountRate: number | null;
  createdAt: string;
  updatedAt: string;
  dealerClass?: DealerClass;
}

export interface ProductVariant {
  id: string;
  productId: string;

  // Temel Bilgiler
  name: string | null; // Varyant adı: "Kırmızı - Large"
  sku: string;
  barcode: string | null;
  gtinCode: string | null; // Global Trade Item Number
  options: Record<string, string>; // {"color": "Kırmızı", "size": "M"}

  // Fiyatlandırma
  price: number | null; // Ana satış fiyatı
  basePrice: number | null; // Baz fiyat
  costPrice: number | null; // Maliyet fiyatı
  compareAtPrice: number | null; // İndirim öncesi fiyat
  discountRate: number; // İndirim oranı %
  discountedPrice: number | null; // İndirimli fiyat
  taxRate: number; // KDV oranı %
  profitMargin: number | null; // Kâr marjı %

  // Stok Yönetimi
  stock: number;
  minStock: number; // Minimum stok seviyesi
  maxStock: number | null; // Maksimum stok seviyesi
  stockStatus: StockStatus; // Stok durumu

  // Medya
  featuredImage: string | null; // Ana varyant görseli
  image: string | null; // Deprecated: Geriye dönük uyumluluk için

  // Fiziksel Özellikler
  weight: number | null; // Ağırlık (kg)
  width: number | null; // Genişlik (cm)
  height: number | null; // Yükseklik (cm)
  length: number | null; // Uzunluk/Derinlik (cm)

  // SEO
  metaTitle: string | null;
  metaDescription: string | null;
  metaKeywords: string | null;
  ogTitle: string | null;
  ogDescription: string | null;
  ogImage: string | null;

  // Durum
  isActive: boolean;

  createdAt: string;
  updatedAt: string;

  // Relations
  images?: VariantImage[];
  dealerPrices?: VariantDealerPrice[];
}

export interface CreateVariantDto {
  // Temel Bilgiler
  name?: string;
  sku: string;
  barcode?: string;
  gtinCode?: string;
  options: Record<string, string>;

  // Fiyatlandırma
  price?: number | null;
  basePrice?: number | null;
  costPrice?: number | null;
  compareAtPrice?: number | null;
  discountRate?: number;
  discountedPrice?: number | null;
  taxRate?: number;
  profitMargin?: number | null;

  // Stok Yönetimi
  stock?: number;
  minStock?: number;
  maxStock?: number | null;
  stockStatus?: StockStatus;

  // Medya
  featuredImage?: string | null;
  image?: string | null; // Deprecated

  // Fiziksel Özellikler
  weight?: number | null;
  width?: number | null;
  height?: number | null;
  length?: number | null;

  // SEO
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;

  // Durum
  isActive?: boolean;

  // Relations
  images?: Array<{
    imageUrl: string;
    altText?: string;
    title?: string;
    order?: number;
    isMain?: boolean;
  }>;
  dealerPrices?: Array<{
    dealerClassId: string;
    price: number;
    discountRate?: number | null;
  }>;
}

export interface UpdateVariantDto extends Partial<CreateVariantDto> {}

export interface GenerateVariantsDto {
  options: Record<string, string[]>; // {"color": ["Kırmızı", "Mavi"], "size": ["S", "M", "L"]}
}

export interface BulkUpdateVariantsDto {
  variants: Array<{
    id: string;
    stock?: number;
    price?: number | null;
    isActive?: boolean;
  }>;
}

// ============= SLIDER TYPES =============

export interface Slider {
  id: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  image: string;
  buttonText: string | null;
  buttonLink: string | null;
  isActive: boolean;
  order: number;
  animation: string | null;
  duration: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSliderDto {
  title: string;
  subtitle?: string;
  description?: string;
  image: string;
  buttonText?: string;
  buttonLink?: string;
  isActive?: boolean;
  order?: number;
  animation?: string;
  duration?: number;
}

export interface UpdateSliderDto extends Partial<CreateSliderDto> {}

export interface ReorderSliderDto {
  sliders: { id: string; order: number }[];
}

// ============= SLIDER SETTINGS TYPES =============

export interface SliderSettings {
  id: string;
  autoplay: boolean;
  autoplaySpeed: number;
  infinite: boolean;
  dots: boolean;
  arrows: boolean;
  pauseOnHover: boolean;
  height: number;
  transition: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateSliderSettingsDto {
  autoplay?: boolean;
  autoplaySpeed?: number;
  infinite?: boolean;
  dots?: boolean;
  arrows?: boolean;
  pauseOnHover?: boolean;
  height?: number;
  transition?: string;
}

// ============= PAGE TYPES =============

export enum PageType {
  PAGE = 'PAGE',
  PRIVACY_POLICY = 'PRIVACY_POLICY',
  SALES_AGREEMENT = 'SALES_AGREEMENT',
  TERMS = 'TERMS',
}

export enum PageStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
}

export interface Page {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  type: PageType;
  status: PageStatus;
  metaTitle: string | null;
  metaDescription: string | null;
  metaKeywords: string | null;
  views: number;
  isActive: boolean;
  showInMenu: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePageDto {
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  type?: PageType;
  status?: PageStatus;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  isActive?: boolean;
  showInMenu?: boolean;
}

export interface UpdatePageDto extends Partial<CreatePageDto> {}

export interface PageFilters {
  type?: PageType;
  status?: PageStatus;
  isActive?: boolean;
}

// ============= MENU TYPES =============

export enum MenuLocation {
  HEADER = 'HEADER',
  FOOTER = 'FOOTER',
  MOBILE = 'MOBILE',
  SIDEBAR = 'SIDEBAR',
}

export enum MenuItemType {
  PAGE = 'PAGE',
  CATEGORY = 'CATEGORY',
  BRAND = 'BRAND',
  CUSTOM_LINK = 'CUSTOM_LINK',
}

export interface MenuItem {
  id: string;
  menuId: string;
  label: string;
  url: string | null;
  icon: string | null;
  type: MenuItemType;
  pageId: string | null;
  categoryId: string | null;
  brandId: string | null;
  parentId: string | null;
  order: number;
  isActive: boolean;
  openInNewTab: boolean;
  createdAt: string;
  updatedAt: string;
  // Relations
  page?: Pick<Page, 'id' | 'title' | 'slug'> | null;
  category?: Pick<Category, 'id' | 'name' | 'slug'> | null;
  brand?: Pick<Brand, 'id' | 'name' | 'slug'> | null;
  children?: MenuItem[];
}

export interface Menu {
  id: string;
  name: string;
  location: MenuLocation;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  items?: MenuItem[];
  _count?: {
    items: number;
  };
}

export interface CreateMenuDto {
  name: string;
  location: MenuLocation;
  description?: string;
  isActive?: boolean;
}

export interface UpdateMenuDto extends Partial<CreateMenuDto> {}

export interface CreateMenuItemDto {
  menuId: string;
  label: string;
  url?: string;
  icon?: string;
  type: MenuItemType;
  pageId?: string;
  categoryId?: string;
  brandId?: string;
  parentId?: string;
  order?: number;
  isActive?: boolean;
  openInNewTab?: boolean;
}

export interface UpdateMenuItemDto extends Partial<CreateMenuItemDto> {}

export interface ReorderMenuItemsDto {
  items: Array<{
    id: string;
    order: number;
    parentId?: string | null;
  }>;
}
