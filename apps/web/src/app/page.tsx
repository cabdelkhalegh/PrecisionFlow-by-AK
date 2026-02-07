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
            ✅ Foundation Setup Complete
          </h2>
          <div className="space-y-2 text-left">
            <StatusItem checked>Turborepo monorepo initialized</StatusItem>
            <StatusItem checked>TypeScript strict mode configured</StatusItem>
            <StatusItem checked>Next.js 14 web app created</StatusItem>
            <StatusItem checked>Shared packages structure ready</StatusItem>
            <StatusItem checked>TailwindCSS configured</StatusItem>
          </div>
          <div className="mt-6 text-sm text-gray-600">
            <p>Next Phase: Backend Infrastructure & Database Setup</p>
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
