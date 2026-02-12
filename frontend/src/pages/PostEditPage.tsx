import { useParams, useNavigate } from 'react-router-dom'
import PostForm from '@/components/PostForm'

/**
 * 게시글 수정 페이지
 * Route: /posts/:id/edit
 */
export default function PostEditPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  // URL 파라미터 검증
  const postId = id ? parseInt(id, 10) : null

  if (!postId || isNaN(postId)) {
    // 잘못된 ID인 경우 404 페이지로 리다이렉트
    navigate('/404', { replace: true })
    return null
  }

  const handleSuccess = () => {
    navigate(`/posts/${postId}`)
  }

  const handleCancel = () => {
    navigate(`/posts/${postId}`)
  }

  return (
    <PostForm
      postId={postId}
      onSuccess={handleSuccess}
      onCancel={handleCancel}
    />
  )
}
