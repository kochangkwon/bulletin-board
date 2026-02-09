import { useState } from 'react'
import BoardList from './components/BoardList'
import PostDetail from './components/PostDetail'
import PostForm from './components/PostForm'
import { ExternalLink } from 'lucide-react'

function App() {
  const [currentView, setCurrentView] = useState<'list' | 'detail' | 'create' | 'edit'>('list')
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const handleViewPost = (postId: number) => {
    setSelectedPostId(postId)
    setCurrentView('detail')
  }

  const handleCreatePost = () => {
    setCurrentView('create')
  }

  const handleEditPost = (postId: number) => {
    setSelectedPostId(postId)
    setCurrentView('edit')
  }

  const handleBackToList = () => {
    setCurrentView('list')
    setSelectedPostId(null)
    setRefreshTrigger(prev => prev + 1)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">게시판</h1>

            {/* API Docs Link */}
            <a
              href="http://localhost:3000/api-docs"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 transition-colors"
            >
              <ExternalLink className="h-3 w-3" />
              API 문서
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {currentView === 'list' && (
          <BoardList
            onViewPost={handleViewPost}
            onCreatePost={handleCreatePost}
            refreshTrigger={refreshTrigger}
          />
        )}

        {currentView === 'detail' && selectedPostId && (
          <PostDetail
            postId={selectedPostId}
            onEdit={handleEditPost}
            onBack={handleBackToList}
          />
        )}

        {currentView === 'create' && (
          <PostForm
            onSuccess={handleBackToList}
            onCancel={handleBackToList}
          />
        )}

        {currentView === 'edit' && selectedPostId && (
          <PostForm
            postId={selectedPostId}
            onSuccess={handleBackToList}
            onCancel={handleBackToList}
          />
        )}
      </main>
    </div>
  )
}

export default App
