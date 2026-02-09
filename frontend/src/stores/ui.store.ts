import { create } from 'zustand'

interface UIStore {
  currentView: 'list' | 'detail' | 'create' | 'edit'
  selectedPostId: number | null
  isLoading: boolean

  setCurrentView: (view: 'list' | 'detail' | 'create' | 'edit') => void
  setSelectedPostId: (id: number | null) => void
  setIsLoading: (loading: boolean) => void

  // Convenience actions
  viewPost: (postId: number) => void
  createPost: () => void
  editPost: (postId: number) => void
  backToList: () => void
}

export const useUIStore = create<UIStore>((set) => ({
  currentView: 'list',
  selectedPostId: null,
  isLoading: false,

  setCurrentView: (view) => set({ currentView: view }),
  setSelectedPostId: (id) => set({ selectedPostId: id }),
  setIsLoading: (loading) => set({ isLoading: loading }),

  viewPost: (postId) => set({ currentView: 'detail', selectedPostId: postId }),
  createPost: () => set({ currentView: 'create', selectedPostId: null }),
  editPost: (postId) => set({ currentView: 'edit', selectedPostId: postId }),
  backToList: () => set({ currentView: 'list', selectedPostId: null }),
}))
