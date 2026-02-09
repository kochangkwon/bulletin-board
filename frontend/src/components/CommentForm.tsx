import { useState } from 'react'
import { commentsAPI } from '../services/api'
import { Button } from './ui/button'
import { X } from 'lucide-react'

interface CommentFormProps {
  postId: number
  parentId?: number | null
  onCommentAdded: () => void
  onCancel?: () => void
  isReply?: boolean
}

function CommentForm({
  postId,
  parentId = null,
  onCommentAdded,
  onCancel,
  isReply = false
}: CommentFormProps) {
  const [formData, setFormData] = useState({
    content: '',
    author: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.content.trim() || !formData.author.trim()) {
      setError('모든 필드를 입력해주세요')
      return
    }

    try {
      setLoading(true)
      setError(null)

      const commentData = {
        ...formData,
        ...(parentId && { parent_id: parentId })
      }

      await commentsAPI.create(postId, commentData)

      // Reset form
      setFormData({
        content: '',
        author: '',
      })

      onCommentAdded()

      // If it's a reply form, call onCancel to close it
      if (isReply && onCancel) {
        onCancel()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '댓글 등록 실패')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`${isReply ? 'bg-gray-50 p-3 rounded-lg' : ''}`}>
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold text-gray-900 text-sm">
          {isReply ? '답글 작성' : '댓글 작성'}
        </h4>
        {isReply && onCancel && (
          <Button
            onClick={onCancel}
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 px-2 py-1.5 rounded-md text-xs mb-2 border border-red-200">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-2">
        <div>
          <input
            type="text"
            name="author"
            value={formData.author}
            onChange={handleChange}
            placeholder="작성자"
            maxLength={50}
            required
            className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <textarea
            name="content"
            value={formData.content}
            onChange={handleChange}
            placeholder="내용을 입력하세요"
            rows={3}
            maxLength={500}
            required
            className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 resize-none"
          />
        </div>

        <div className="flex gap-2 justify-end">
          {isReply && onCancel && (
            <Button
              type="button"
              onClick={onCancel}
              variant="ghost"
              className="text-gray-600 hover:bg-gray-100 text-xs h-7"
            >
              취소
            </Button>
          )}
          <Button
            type="submit"
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-600 text-white text-xs h-7 px-3"
          >
            {loading ? '등록 중...' : '등록'}
          </Button>
        </div>
      </form>
    </div>
  )
}

export default CommentForm
