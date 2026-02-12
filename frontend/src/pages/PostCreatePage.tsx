import { useNavigate } from 'react-router-dom'
import PostForm from '@/components/PostForm'

/**
 * 게시글 작성 페이지
 * Route: /posts/create
 */
export default function PostCreatePage() {
  const navigate = useNavigate()

  const handleSuccess = () => {
    navigate('/')
  }

  const handleCancel = () => {
    navigate('/')
  }

  return (
    <PostForm
      onSuccess={handleSuccess}
      onCancel={handleCancel}
    />
  )
}
