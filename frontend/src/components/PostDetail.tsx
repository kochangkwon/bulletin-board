import { useState, useEffect } from 'react'
import { postsAPI, commentsAPI } from '../services/api'
import CommentForm from './CommentForm'
import { Button } from './ui/button'
import { ArrowLeft } from 'lucide-react'
import type { Post, Comment } from '../types/common.types'

interface PostDetailProps {
  postId: number
  onEdit: (postId: number) => void
  onBack: () => void
}

interface CommentWithReplies extends Comment {
  replies?: CommentWithReplies[]
}

function PostDetail({ postId, onEdit, onBack }: PostDetailProps) {
  const [post, setPost] = useState<Post | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [replyingTo, setReplyingTo] = useState<number | null>(null)

  useEffect(() => {
    fetchPostAndComments()
  }, [postId])

  const fetchPostAndComments = async () => {
    try {
      setLoading(true)
      const [postResponse, commentsResponse] = await Promise.all([
        postsAPI.getById(postId),
        commentsAPI.getByPostId(postId),
      ])
      setPost(postResponse.data)
      setComments(commentsResponse.data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : '게시글 로드 실패')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('정말 이 게시글을 삭제하시겠습니까?')) {
      return
    }

    try {
      await postsAPI.delete(postId)
      alert('게시글이 삭제되었습니다')
      onBack()
    } catch (err) {
      alert('게시글 삭제 실패: ' + (err instanceof Error ? err.message : '알 수 없는 오류'))
    }
  }

  const handleDeleteComment = async (commentId: number) => {
    if (!window.confirm('정말 이 댓글을 삭제하시겠습니까?')) {
      return
    }

    try {
      await commentsAPI.delete(commentId)
      setComments(comments.filter(c => c.id !== commentId))
    } catch (err) {
      alert('댓글 삭제 실패: ' + (err instanceof Error ? err.message : '알 수 없는 오류'))
    }
  }

  const handleCommentAdded = () => {
    fetchPostAndComments()
    setReplyingTo(null)
  }

  const handleReply = (commentId: number) => {
    setReplyingTo(commentId)
  }

  const handleCancelReply = () => {
    setReplyingTo(null)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // Extract YouTube video ID from URL
  const extractYouTubeId = (url: string): string | null => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/,
      /youtube\.com\/embed\/([^&\s]+)/,
    ]

    for (const pattern of patterns) {
      const match = url.match(pattern)
      if (match && match[1]) {
        return match[1]
      }
    }
    return null
  }

  // Render comment content with YouTube embeds
  const renderCommentContent = (content: string) => {
    const urlPattern = /(https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)[\w-]+)/g
    const parts = content.split(urlPattern)

    return parts.map((part, index) => {
      const videoId = extractYouTubeId(part)
      if (videoId) {
        return (
          <div key={index} className="my-3">
            <iframe
              width="100%"
              height="315"
              src={`https://www.youtube.com/embed/${videoId}`}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="rounded-lg"
            />
          </div>
        )
      }
      return part ? <span key={index}>{part}</span> : null
    })
  }

  // Build comment tree structure
  const buildCommentTree = (comments: Comment[]): CommentWithReplies[] => {
    const commentMap = new Map<number, CommentWithReplies>()
    const rootComments: CommentWithReplies[] = []

    // First pass: create a map of all comments
    comments.forEach(comment => {
      commentMap.set(comment.id, { ...comment, replies: [] })
    })

    // Second pass: build the tree structure
    comments.forEach(comment => {
      const commentWithReplies = commentMap.get(comment.id)!
      if (comment.parent_id) {
        const parent = commentMap.get(comment.parent_id)
        if (parent) {
          parent.replies = parent.replies || []
          parent.replies.push(commentWithReplies)
        }
      } else {
        rootComments.push(commentWithReplies)
      }
    })

    return rootComments
  }

  const renderComment = (comment: CommentWithReplies, depth: number = 0) => {
    const isReplying = replyingTo === comment.id
    const hasReplies = comment.replies && comment.replies.length > 0

    return (
      <div key={comment.id} className={depth > 0 ? 'ml-6 mt-3' : ''}>
        <div className="py-3">
          {/* Comment Header */}
          <div className="flex items-start justify-between mb-1.5">
            <div>
              <span className="font-semibold text-gray-900 text-sm">{comment.author}</span>
              <span className="text-xs text-gray-500 ml-2">
                · {formatDate(comment.created_at)}
              </span>
            </div>
            <div className="flex gap-1.5">
              <Button
                onClick={(e) => {
                  e.stopPropagation()
                  handleReply(comment.id)
                }}
                size="sm"
                className="bg-gray-500 hover:bg-gray-600 text-white text-xs h-6 px-2"
              >
                수정
              </Button>
              <Button
                onClick={(e) => {
                  e.stopPropagation()
                  handleDeleteComment(comment.id)
                }}
                size="sm"
                className="bg-red-500 hover:bg-red-600 text-white text-xs h-6 px-2"
              >
                삭제
              </Button>
            </div>
          </div>

          {/* Comment Content */}
          <div className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap">
            {renderCommentContent(comment.content)}
          </div>
        </div>

        {/* Reply Form */}
        {isReplying && (
          <div className="ml-6 mb-3">
            <CommentForm
              postId={postId}
              parentId={comment.id}
              onCommentAdded={handleCommentAdded}
              onCancel={handleCancelReply}
              isReply={true}
            />
          </div>
        )}

        {/* Nested Replies */}
        {hasReplies && (
          <div className="border-l-2 border-gray-200 pl-3">
            {comment.replies!.map(reply => renderComment(reply, depth + 1))}
          </div>
        )}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-800 mx-auto" />
          <p className="mt-4 text-gray-600">게시글을 불러오는 중...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm p-8 text-center">
        <p className="text-red-600 mb-4">오류: {error}</p>
        <Button onClick={onBack} variant="ghost">
          <ArrowLeft className="mr-2 h-4 w-4" />
          목록으로
        </Button>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm p-8 text-center">
        <p className="text-gray-600 mb-4">게시글을 찾을 수 없습니다</p>
        <Button onClick={onBack} variant="ghost">
          <ArrowLeft className="mr-2 h-4 w-4" />
          목록으로
        </Button>
      </div>
    )
  }

  const commentTree = buildCommentTree(comments)
  const totalComments = comments.length

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back Button */}
      <div>
        <Button onClick={onBack} variant="ghost" className="text-gray-600 hover:text-gray-900 -ml-2">
          <ArrowLeft className="mr-2 h-4 w-4" />
          목록으로
        </Button>
      </div>

      {/* Post Content */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h1 className="text-lg font-bold text-gray-900 mb-1">{post.title}</h1>
            <p className="text-xs text-gray-500">
              작성자: {post.author} · {formatDate(post.created_at)}
              {post.updated_at !== post.created_at && ' (수정됨)'}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => onEdit(postId)}
              size="sm"
              className="bg-blue-500 hover:bg-blue-600 text-white text-xs h-7 px-3"
            >
              수정
            </Button>
            <Button
              onClick={handleDelete}
              size="sm"
              className="bg-red-500 hover:bg-red-600 text-white text-xs h-7 px-3"
            >
              삭제
            </Button>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="whitespace-pre-wrap text-gray-800 text-sm leading-relaxed">
            {post.content}
          </p>
        </div>
      </div>

      {/* Comments Section */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">
          댓글 ({totalComments})
        </h2>

        {/* Comments List */}
        <div className="space-y-3 mb-6">
          {commentTree.length === 0 ? (
            <p className="text-center text-gray-500 py-6 text-sm">
              아직 댓글이 없습니다. 첫 댓글을 작성해보세요!
            </p>
          ) : (
            commentTree.map(comment => renderComment(comment))
          )}
        </div>

        {/* Comment Form */}
        <div className="border-t border-gray-200 pt-4">
          <CommentForm postId={postId} onCommentAdded={handleCommentAdded} />
        </div>
      </div>
    </div>
  )
}

export default PostDetail
