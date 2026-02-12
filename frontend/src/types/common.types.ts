// API Response types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  error?: string
  errors?: ValidationError[]
  pagination?: PaginationResult
}

export interface ValidationError {
  field: string
  message: string
}

// Pagination types
export interface PaginationResult {
  page: number
  limit: number
  total: number
  totalPages: number
}

// Entity types
export interface Post {
  id: number
  title: string
  content: string
  author: string
  created_at: string
  updated_at: string
  has_ai_response?: number  // AI 답변 여부 (0: 없음, 1: 있음)
}

export interface Comment {
  id: number
  post_id: number
  parent_id?: number | null
  content: string
  author: string
  created_at: string
}

// Form types
export interface PostFormData {
  title: string
  content: string
  author: string
}

export interface CommentFormData {
  content: string
  author: string
}
