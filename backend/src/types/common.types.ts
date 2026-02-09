// Result Pattern for error handling
export type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E }

// API Response types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  error?: string
  errors?: ValidationError[]
}

export interface ValidationError {
  field: string
  message: string
}

// Pagination types
export interface PaginationParams {
  page: number
  limit: number
}

export interface PaginationResult {
  page: number
  limit: number
  total: number
  totalPages: number
}

// Database entity types
export interface Post {
  id: number
  title: string
  content: string
  author: string
  created_at: string
  updated_at: string
}

export interface Comment {
  id: number
  post_id: number
  content: string
  author: string
  created_at: string
}

// Request body types
export interface CreatePostBody {
  title: string
  content: string
  author: string
}

export interface UpdatePostBody {
  title?: string
  content?: string
  author?: string
}

export interface CreateCommentBody {
  content: string
  author: string
}
