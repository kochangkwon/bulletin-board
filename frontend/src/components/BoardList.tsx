import { useState, useEffect } from 'react'
import { postsAPI } from '../services/api'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table'
import { Button } from './ui/button'
import { Card } from './ui/card'
import { ChevronLeft, ChevronRight, Search, FileText, Bot } from 'lucide-react'
import type { Post, PaginationResult } from '../types/common.types'

interface BoardListProps {
  onViewPost: (postId: number) => void
  onCreatePost: () => void
  refreshTrigger: number
}

function BoardList({ onViewPost, onCreatePost, refreshTrigger }: BoardListProps) {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [pagination, setPagination] = useState<PaginationResult>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  })

  useEffect(() => {
    fetchPosts()
  }, [pagination.page, refreshTrigger])

  const fetchPosts = async (search?: string) => {
    try {
      setLoading(true)
      const searchTerm = search !== undefined ? search : searchQuery
      const response = await postsAPI.getAll(pagination.page, pagination.limit, searchTerm)
      setPosts(response.data)
      setPagination(prev => ({ ...prev, ...response.pagination }))
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch posts')
    } finally {
      setLoading(false)
    }
  }

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    setPagination(prev => ({ ...prev, page: 1 }))
    await fetchPosts(searchQuery)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  // Generate page numbers
  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    const maxVisible = 5
    const { page, totalPages } = pagination

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      if (page <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i)
        pages.push('...')
        pages.push(totalPages)
      } else if (page >= totalPages - 2) {
        pages.push(1)
        pages.push('...')
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i)
      } else {
        pages.push(1)
        pages.push('...')
        pages.push(page - 1)
        pages.push(page)
        pages.push(page + 1)
        pages.push('...')
        pages.push(totalPages)
      }
    }

    return pages
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
          <p className="mt-4 text-muted-foreground">게시글을 불러오는 중...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Card className="p-8 text-center">
        <p className="text-destructive">오류: {error}</p>
        <Button onClick={fetchPosts} className="mt-4" variant="outline">
          다시 시도
        </Button>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Board Table */}
      {posts.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground text-lg mb-4">아직 게시글이 없습니다.</p>
          <Button onClick={onCreatePost}>첫 게시글을 작성해보세요!</Button>
        </Card>
      ) : (
        <div className="bg-white rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 hover:bg-gray-50">
                <TableHead className="w-[80px] text-center font-semibold text-gray-700">No</TableHead>
                <TableHead className="font-semibold text-gray-700">제목</TableHead>
                <TableHead className="w-[120px] text-center font-semibold text-gray-700">글쓴이</TableHead>
                <TableHead className="w-[120px] text-center font-semibold text-gray-700">작성시간</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {posts.map((post, index) => {
                const postNumber = pagination.total - (pagination.page - 1) * pagination.limit - index
                return (
                  <TableRow
                    key={post.id}
                    className="cursor-pointer hover:bg-gray-50/50 border-b"
                    onClick={() => onViewPost(post.id)}
                  >
                    <TableCell className="text-center text-sm text-gray-600">
                      {postNumber}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <FileText className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                        <span className="text-sm text-gray-900 hover:underline">
                          {post.title}
                        </span>
                        {post.has_ai_response === 1 && (
                          <Bot
                            className="h-4 w-4 text-blue-500 inline-block ml-1"
                            aria-label="AI 답변 있음"
                            title="AI 답변 있음"
                          />
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center text-sm text-gray-600">
                      {post.author}
                    </TableCell>
                    <TableCell className="text-center text-sm text-gray-500">
                      {formatDate(post.created_at)}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Search Bar and Write Button */}
      <div className="flex items-center justify-center gap-3">
        <form onSubmit={handleSearch} className="flex items-center gap-2">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="검색"
              className="w-48 px-3 py-1.5 pr-8 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <Search className="h-3.5 w-3.5" />
            </button>
          </div>
        </form>
        <Button
          onClick={onCreatePost}
          className="bg-gray-800 hover:bg-gray-900 text-white px-4 py-1.5 rounded-full text-sm h-auto"
        >
          글쓰기
        </Button>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page === 1}
            className="h-8 w-8"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          {getPageNumbers().map((pageNum, idx) => {
            if (pageNum === '...') {
              return (
                <span key={`ellipsis-${idx}`} className="px-2 text-muted-foreground">
                  ...
                </span>
              )
            }

            return (
              <Button
                key={pageNum}
                variant={pagination.page === pageNum ? 'default' : 'ghost'}
                size="icon"
                onClick={() => handlePageChange(pageNum as number)}
                className={`h-8 w-8 ${
                  pagination.page === pageNum
                    ? 'bg-gray-800 hover:bg-gray-900'
                    : 'hover:bg-gray-100'
                }`}
              >
                {pageNum}
              </Button>
            )
          })}

          <Button
            variant="ghost"
            size="icon"
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page === pagination.totalPages}
            className="h-8 w-8"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}

export default BoardList
