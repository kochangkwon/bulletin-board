import { create } from 'zustand'

/**
 * UI 상태 관리 Store
 *
 * React Router로 네비게이션 상태를 관리하므로
 * 이 store는 전역 UI 상태 (로딩, 모달 등)만 관리합니다.
 *
 * 이전에 관리하던 상태:
 * - currentView → React Router (URL)로 대체
 * - selectedPostId → React Router (URL params)로 대체
 */
interface UIStore {
  // 전역 로딩 상태 (향후 사용 가능)
  isLoading: boolean
  setIsLoading: (loading: boolean) => void

  // 향후 추가 가능한 UI 상태
  // isModalOpen: boolean
  // modalContent: ReactNode | null
  // openModal: (content: ReactNode) => void
  // closeModal: () => void
}

export const useUIStore = create<UIStore>((set) => ({
  isLoading: false,
  setIsLoading: (loading) => set({ isLoading: loading }),
}))
