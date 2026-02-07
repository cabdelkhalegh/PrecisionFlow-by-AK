import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="mx-auto max-w-4xl px-6 text-center">
        <h1 className="mb-6 text-6xl font-bold text-gray-900">
          🎯 TiKiT OS
        </h1>
        <p className="mb-8 text-2xl text-gray-700">
          Campaign Execution & Intelligence Platform
        </p>
        <div className="rounded-lg bg-white p-8 shadow-xl">
          <h2 className="mb-4 text-xl font-semibold text-gray-800">
            ✅ Phase 1 & 2 Complete
          </h2>
          <div className="space-y-2 text-left">
            <StatusItem checked>Backend Infrastructure (Phase 1)</StatusItem>
            <StatusItem checked>Database schema with RLS</StatusItem>
            <StatusItem checked>tRPC API with authentication</StatusItem>
            <StatusItem checked>Clients & Briefs routers (Phase 2)</StatusItem>
            <StatusItem checked>AI Integration (Google Gemini)</StatusItem>
            <StatusItem checked>Risk assessment logic</StatusItem>
            <StatusItem checked>Next.js tRPC setup</StatusItem>
          </div>
          <div className="mt-6">
            <Link
              href="/dashboard"
              className="inline-block rounded-lg bg-blue-600 px-8 py-3 text-white font-medium hover:bg-blue-700 transition-colors"
            >
              Go to Dashboard →
            </Link>
          </div>
          <div className="mt-6 text-sm text-gray-600">
            <p>Next Phase: Web UI Components & Testing</p>
          </div>
        </div>
      </div>
    </main>
  );
}

function StatusItem({ checked, children }: { checked: boolean; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <span className={checked ? 'text-green-500' : 'text-gray-400'}>
        {checked ? '✓' : '○'}
      </span>
      <span className="text-gray-700">{children}</span>
    </div>
  );
}
