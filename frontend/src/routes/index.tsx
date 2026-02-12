import { Routes, Route, Navigate } from 'react-router-dom'
import BoardListPage from '@/pages/BoardListPage'
import PostDetailPage from '@/pages/PostDetailPage'
import PostCreatePage from '@/pages/PostCreatePage'
import PostEditPage from '@/pages/PostEditPage'
import NotFoundPage from '@/pages/NotFoundPage'

/**
 * 애플리케이션 라우트 정의
 *
 * URL 구조:
 * - / : 게시글 목록
 * - /posts/:id : 게시글 상세
 * - /posts/create : 게시글 작성
 * - /posts/:id/edit : 게시글 수정
 * - /404 : Not Found
 * - /* : 잘못된 경로 (404로 리다이렉트)
 */
export default function AppRoutes() {
  return (
    <Routes>
      {/* 게시글 목록 */}
      <Route path="/" element={<BoardListPage />} />

      {/* 게시글 작성 - :id보다 먼저 정의해야 함 */}
      <Route path="/posts/create" element={<PostCreatePage />} />

      {/* 게시글 상세 */}
      <Route path="/posts/:id" element={<PostDetailPage />} />

      {/* 게시글 수정 */}
      <Route path="/posts/:id/edit" element={<PostEditPage />} />

      {/* 404 페이지 */}
      <Route path="/404" element={<NotFoundPage />} />

      {/* 잘못된 경로는 404로 리다이렉트 */}
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  )
}
