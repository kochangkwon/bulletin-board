import { useNavigate } from 'react-router-dom'
import BoardList from '@/components/BoardList'

/**
 * 게시글 목록 페이지
 * Route: /
 */
export default function BoardListPage() {
  const navigate = useNavigate()

  const handleViewPost = (postId: number) => {
    navigate(`/posts/${postId}`)
  }

  const handleCreatePost = () => {
    navigate('/posts/create')
  }

  return (
    <BoardList
      onViewPost={handleViewPost}
      onCreatePost={handleCreatePost}
      refreshTrigger={0}
    />
  )
}
