import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center space-y-6 p-8">
        <h1 className="text-5xl font-bold text-gray-900">
          🎯 TiKiT OS
        </h1>
        <p className="text-xl text-gray-700 max-w-2xl">
          Campaign Execution & Intelligence Platform
        </p>
        <p className="text-gray-600">
          Enterprise-grade operating system for influencer marketing agencies
        </p>
        <div className="pt-4">
          <Link 
            href="/dashboard"
            className="inline-block bg-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
