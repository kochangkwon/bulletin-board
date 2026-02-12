import { BrowserRouter, Link } from 'react-router-dom'
import { ExternalLink } from 'lucide-react'
import AppRoutes from '@/routes'

/**
 * 메인 애플리케이션 컴포넌트
 *
 * React Router를 사용하여 URL 기반 라우팅 구현
 * - BrowserRouter: HTML5 History API 사용
 * - AppRoutes: 라우트 정의 (src/routes/index.tsx)
 */
function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="border-b bg-white">
          <div className="container mx-auto px-4 py-6">
            <div className="text-center">
              <Link to="/" className="inline-block">
                <h1 className="text-2xl font-bold text-gray-800 mb-2 hover:text-gray-600 transition-colors">
                  게시판
                </h1>
              </Link>

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

        {/* Main Content - Routes */}
        <main className="container mx-auto px-4 py-8">
          <AppRoutes />
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App
