/**
 * API Services Central Export
 * Tüm API servislerini tek noktadan export eder
 */

// Types
export * from './types';

// API Client
export { api, ApiError } from './client';

// Services
export { categoryService } from './category.service';
export { brandService } from './brand.service';
export { supplierService} from './supplier.service';
export { dealerClassService } from './dealerClass.service';
export { productService } from './product.service';
export { uploadService } from './upload.service';
export { currencyService } from './currency.service';
export type { Currency } from './currency.service';
export { sliderService } from './slider.service';
export { sliderSettingsService } from './slider-settings.service';

// API Modules
export * as productsApi from './products';
export * as brandsApi from './brands';
export * as suppliersApi from './suppliers';
export * as categoriesApi from './categories';
export * as dealerClassesApi from './dealer-classes';
export * as variantOptionsApi from './variant-options';
export * as productVariantsApi from './product-variants';

// Auth (auth.ts'den)
export { authAPI, tokenManager, userManager, ApiError as AuthApiError } from '../auth';
