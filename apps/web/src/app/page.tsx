export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm">
        <div className="flex flex-col items-center gap-8">
          <h1 className="text-6xl font-bold text-center bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            🎯 TiKiT OS
          </h1>
          
          <p className="text-2xl text-gray-600 text-center max-w-2xl">
            Campaign Execution & Intelligence Platform
          </p>

          <div className="mt-8 p-8 bg-white rounded-lg shadow-lg border border-gray-200 max-w-3xl">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">
              ✅ Web Application Status
            </h2>
            
            <div className="space-y-4 text-gray-700">
              <div className="flex items-start gap-3">
                <span className="text-green-500 text-xl">✓</span>
                <div>
                  <strong>Monorepo Structure:</strong> Initialized with Turborepo + pnpm workspaces
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <span className="text-green-500 text-xl">✓</span>
                <div>
                  <strong>Next.js 14 App:</strong> Running with App Router and React Server Components
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <span className="text-green-500 text-xl">✓</span>
                <div>
                  <strong>TailwindCSS:</strong> Configured and working
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <span className="text-yellow-500 text-xl">⚠</span>
                <div>
                  <strong>Supabase Integration:</strong> Needs configuration
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <span className="text-yellow-500 text-xl">⚠</span>
                <div>
                  <strong>Authentication:</strong> To be implemented
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <span className="text-yellow-500 text-xl">⚠</span>
                <div>
                  <strong>Campaign Management:</strong> To be built
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-semibold mb-3 text-gray-800">
                🚀 Next Steps to Make Fully Functional:
              </h3>
              <ol className="list-decimal list-inside space-y-2 text-gray-700">
                <li>Set up Supabase project and configure connection</li>
                <li>Implement authentication with Supabase Auth</li>
                <li>Create database schema and migrations</li>
                <li>Build campaign management UI</li>
                <li>Integrate AI features (Google Gemini)</li>
                <li>Implement approval workflows</li>
                <li>Add financial tracking</li>
                <li>Build reporting dashboards</li>
              </ol>
            </div>
          </div>

          <div className="mt-8 flex gap-4">
            <a
              href="/docs"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              View Documentation
            </a>
            <a
              href="/login"
              className="px-6 py-3 bg-white text-blue-600 border-2 border-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-semibold"
            >
              Login (Coming Soon)
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
