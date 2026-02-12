import { Link } from 'react-router-dom'
import { AlertCircle, Home } from 'lucide-react'

/**
 * 404 Not Found Page
 * 존재하지 않는 경로에 접근했을 때 표시되는 페이지
 */
export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="flex justify-center mb-4">
          <AlertCircle className="h-16 w-16 text-orange-500" />
        </div>

        <h1 className="text-4xl font-bold text-gray-900 mb-2">404</h1>
        <h2 className="text-xl font-semibold text-gray-700 mb-4">
          페이지를 찾을 수 없습니다
        </h2>

        <p className="text-gray-600 mb-6">
          요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.
        </p>

        <Link
          to="/"
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
        >
          <Home className="h-5 w-5" />
          홈으로 돌아가기
        </Link>
      </div>
    </div>
  )
}
