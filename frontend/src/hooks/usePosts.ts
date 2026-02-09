import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { postsAPI } from '@/services/api'
import { toast } from 'sonner'
import type { Post, PostFormData } from '@/types/common.types'

// Query keys
const postsKeys = {
  all: ['posts'] as const,
  lists: () => [...postsKeys.all, 'list'] as const,
  list: (page: number, limit: number) => [...postsKeys.lists(), { page, limit }] as const,
  details: () => [...postsKeys.all, 'detail'] as const,
  detail: (id: number) => [...postsKeys.details(), id] as const,
}

// Get all posts with pagination
export function usePosts(page: number = 1, limit: number = 10) {
  return useQuery({
    queryKey: postsKeys.list(page, limit),
    queryFn: async () => {
      const response = await postsAPI.getAll(page, limit)
      return response
    },
  })
}

// Get single post
export function usePost(id: number) {
  return useQuery({
    queryKey: postsKeys.detail(id),
    queryFn: async () => {
      const response = await postsAPI.getById(id)
      return response.data
    },
    enabled: !!id,
  })
}

// Create post mutation
export function useCreatePost() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: PostFormData) => postsAPI.create(data),
    onMutate: async (newPost) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: postsKeys.lists() })

      // Snapshot previous value
      const previousPosts = queryClient.getQueryData(postsKeys.lists())

      // Optimistically update (optional for create)
      // queryClient.setQueryData(postsKeys.lists(), (old: any) => {
      //   return old ? { ...old, data: [newPost, ...old.data] } : old
      // })

      return { previousPosts }
    },
    onError: (err, newPost, context) => {
      // Rollback on error
      if (context?.previousPosts) {
        queryClient.setQueryData(postsKeys.lists(), context.previousPosts)
      }
      toast.error('Failed to create post')
    },
    onSuccess: () => {
      toast.success('Post created successfully')
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: postsKeys.lists() })
    },
  })
}

// Update post mutation
export function useUpdatePost() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<PostFormData> }) =>
      postsAPI.update(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: postsKeys.detail(id) })

      const previousPost = queryClient.getQueryData(postsKeys.detail(id))

      // Optimistic update
      queryClient.setQueryData(postsKeys.detail(id), (old: Post | undefined) => {
        return old ? { ...old, ...data } : old
      })

      return { previousPost }
    },
    onError: (err, { id }, context) => {
      if (context?.previousPost) {
        queryClient.setQueryData(postsKeys.detail(id), context.previousPost)
      }
      toast.error('Failed to update post')
    },
    onSuccess: () => {
      toast.success('Post updated successfully')
    },
    onSettled: (_, __, { id }) => {
      queryClient.invalidateQueries({ queryKey: postsKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: postsKeys.lists() })
    },
  })
}

// Delete post mutation
export function useDeletePost() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => postsAPI.delete(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: postsKeys.lists() })

      const previousPosts = queryClient.getQueryData(postsKeys.lists())

      // Optimistic delete
      queryClient.setQueryData(postsKeys.lists(), (old: any) => {
        if (!old) return old
        return {
          ...old,
          data: old.data.filter((post: Post) => post.id !== id),
        }
      })

      return { previousPosts }
    },
    onError: (err, id, context) => {
      if (context?.previousPosts) {
        queryClient.setQueryData(postsKeys.lists(), context.previousPosts)
      }
      toast.error('Failed to delete post')
    },
    onSuccess: () => {
      toast.success('Post deleted successfully')
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: postsKeys.lists() })
    },
  })
}
