import { z } from 'zod'

// Comment creation schema
export const createCommentSchema = z.object({
  content: z.string().min(1, 'Content is required'),
  author: z.string().min(1, 'Author is required').max(100, 'Author name must be less than 100 characters')
})

// Comment ID param schema
export const commentIdSchema = z.object({
  id: z.string().regex(/^\d+$/, 'Invalid comment ID').transform(Number)
})

// Post ID param schema for comments
export const postIdForCommentSchema = z.object({
  postId: z.string().regex(/^\d+$/, 'Invalid post ID').transform(Number)
})

// Type exports
export type CreateCommentInput = z.infer<typeof createCommentSchema>
export type CommentIdParam = z.infer<typeof commentIdSchema>
export type PostIdForComment = z.infer<typeof postIdForCommentSchema>
