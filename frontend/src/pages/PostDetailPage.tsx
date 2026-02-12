import { useParams, useNavigate } from 'react-router-dom'
import PostDetail from '@/components/PostDetail'

/**
 * 게시글 상세 페이지
 * Route: /posts/:id
 */
export default function PostDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  // URL 파라미터 검증
  const postId = id ? parseInt(id, 10) : null

  if (!postId || isNaN(postId)) {
    // 잘못된 ID인 경우 404 페이지로 리다이렉트
    navigate('/404', { replace: true })
    return null
  }

  const handleEdit = (postId: number) => {
    navigate(`/posts/${postId}/edit`)
  }

  const handleBack = () => {
    navigate('/')
  }

  return (
    <PostDetail
      postId={postId}
      onEdit={handleEdit}
      onBack={handleBack}
    />
  )
}
