import { z } from 'zod'

// Post creation schema
export const createPostSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  content: z.string().min(1, 'Content is required'),
  author: z.string().min(1, 'Author is required').max(100, 'Author name must be less than 100 characters')
})

// Post update schema (all fields optional)
export const updatePostSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  content: z.string().min(1).optional(),
  author: z.string().min(1).max(100).optional()
}).refine(data => Object.keys(data).length > 0, {
  message: 'At least one field must be provided for update'
})

// Post ID param schema
export const postIdSchema = z.object({
  id: z.string().regex(/^\d+$/, 'Invalid post ID').transform(Number)
})

// Query params schema
export const paginationSchema = z.object({
  page: z.string().optional().default('1').transform(Number),
  limit: z.string().optional().default('10').transform(Number)
}).refine(data => data.page > 0, {
  message: 'Page must be greater than 0'
}).refine(data => data.limit > 0 && data.limit <= 100, {
  message: 'Limit must be between 1 and 100'
})

// Type exports
export type CreatePostInput = z.infer<typeof createPostSchema>
export type UpdatePostInput = z.infer<typeof updatePostSchema>
export type PostIdParam = z.infer<typeof postIdSchema>
export type PaginationQuery = z.infer<typeof paginationSchema>
