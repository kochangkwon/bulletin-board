import type {
  ApiResponse,
  Post,
  Comment,
  PostFormData,
  CommentFormData,
} from '@/types/common.types'

// Get API base URL from environment variable
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'

// Type-safe fetch function
async function fetchAPI<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  })

  const data: ApiResponse<T> = await response.json()

  if (!response.ok) {
    throw new Error(data.message || data.error || 'API 요청 실패')
  }

  return data as T
}

// Posts API response types
interface PostsListResponse extends ApiResponse<Post[]> {
  data: Post[]
}

interface PostDetailResponse extends ApiResponse<Post> {
  data: Post
}

// Posts API
export const postsAPI = {
  /**
   * Get all posts with pagination and search
   * @param page - Page number (default: 1)
   * @param limit - Items per page (default: 10)
   * @param search - Search query string
   */
  getAll: (
    page: number = 1,
    limit: number = 10,
    search: string = ''
  ): Promise<PostsListResponse> => {
    const searchParam = search ? `&search=${encodeURIComponent(search)}` : ''
    return fetchAPI<PostsListResponse>(`/posts?page=${page}&limit=${limit}${searchParam}`)
  },

  /**
   * Get a single post by ID
   * @param id - Post ID
   */
  getById: (id: number): Promise<PostDetailResponse> => {
    return fetchAPI<PostDetailResponse>(`/posts/${id}`)
  },

  /**
   * Create a new post
   * @param postData - Post data to create
   */
  create: (postData: PostFormData): Promise<ApiResponse<Post>> => {
    return fetchAPI<ApiResponse<Post>>('/posts', {
      method: 'POST',
      body: JSON.stringify(postData),
    })
  },

  /**
   * Update an existing post
   * @param id - Post ID to update
   * @param postData - Updated post data
   */
  update: (id: number, postData: Partial<PostFormData>): Promise<ApiResponse<Post>> => {
    return fetchAPI<ApiResponse<Post>>(`/posts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(postData),
    })
  },

  /**
   * Delete a post
   * @param id - Post ID to delete
   */
  delete: (id: number): Promise<ApiResponse<void>> => {
    return fetchAPI<ApiResponse<void>>(`/posts/${id}`, {
      method: 'DELETE',
    })
  },
}

// Comments API response types
interface CommentsListResponse extends ApiResponse<Comment[]> {
  data: Comment[]
}

// Comments API
export const commentsAPI = {
  /**
   * Get all comments for a post
   * @param postId - Post ID
   */
  getByPostId: (postId: number): Promise<CommentsListResponse> => {
    return fetchAPI<CommentsListResponse>(`/posts/${postId}/comments`)
  },

  /**
   * Create a new comment
   * @param postId - Post ID to comment on
   * @param commentData - Comment data
   */
  create: (postId: number, commentData: CommentFormData): Promise<ApiResponse<Comment>> => {
    return fetchAPI<ApiResponse<Comment>>(`/posts/${postId}/comments`, {
      method: 'POST',
      body: JSON.stringify(commentData),
    })
  },

  /**
   * Delete a comment
   * @param id - Comment ID to delete
   */
  delete: (id: number): Promise<ApiResponse<void>> => {
    return fetchAPI<ApiResponse<void>>(`/comments/${id}`, {
      method: 'DELETE',
    })
  },
}
