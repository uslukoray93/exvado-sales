import type {
  Category,
  CategoryTree,
  CreateCategoryDto,
  UpdateCategoryDto,
  ApiResponse,
  PaginatedResponse
} from './types'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002'

// Helper function for API calls
async function apiCall<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_URL}${endpoint}`

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Network error' }))
    throw new Error(error.message || `HTTP error! status: ${response.status}`)
  }

  return response.json()
}

// ============= CATEGORIES =============

export async function getCategories(): Promise<Category[]> {
  const response = await apiCall<ApiResponse<Category[]>>('/api/categories')
  return response.data || []
}

export async function getCategoryTree(): Promise<CategoryTree[]> {
  const response = await apiCall<ApiResponse<CategoryTree[]>>('/api/categories/tree')
  return response.data || []
}

export async function getCategoryById(id: string): Promise<Category> {
  const response = await apiCall<ApiResponse<Category>>(`/api/categories/${id}`)
  if (!response.data) {
    throw new Error('Category not found')
  }
  return response.data
}

export async function getCategoryBySlug(slug: string): Promise<Category> {
  const response = await apiCall<ApiResponse<Category>>(`/api/categories/slug/${slug}`)
  if (!response.data) {
    throw new Error('Category not found')
  }
  return response.data
}

export async function createCategory(data: CreateCategoryDto): Promise<Category> {
  const response = await apiCall<ApiResponse<Category>>('/api/categories', {
    method: 'POST',
    body: JSON.stringify(data),
  })

  if (!response.data) {
    throw new Error('Failed to create category')
  }

  return response.data
}

export async function updateCategory(id: string, data: UpdateCategoryDto): Promise<Category> {
  const response = await apiCall<ApiResponse<Category>>(`/api/categories/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })

  if (!response.data) {
    throw new Error('Failed to update category')
  }

  return response.data
}

export async function deleteCategory(id: string): Promise<void> {
  await apiCall<ApiResponse<void>>(`/api/categories/${id}`, {
    method: 'DELETE',
  })
}

export async function toggleCategoryStatus(id: string): Promise<Category> {
  const response = await apiCall<ApiResponse<Category>>(`/api/categories/${id}/toggle-status`, {
    method: 'PATCH',
  })

  if (!response.data) {
    throw new Error('Failed to toggle category status')
  }

  return response.data
}

// Upload category image
export async function uploadCategoryImage(categoryId: string, file: File): Promise<string> {
  const formData = new FormData()
  formData.append('image', file)

  const response = await fetch(`${API_URL}/api/categories/${categoryId}/image`, {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Upload failed' }))
    throw new Error(error.message || 'Failed to upload image')
  }

  const result = await response.json()
  return result.data.imageUrl
}

// Delete category image
export async function deleteCategoryImage(categoryId: string): Promise<void> {
  await apiCall<ApiResponse<void>>(`/api/categories/${categoryId}/image`, {
    method: 'DELETE',
  })
}
