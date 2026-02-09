import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="mx-auto max-w-5xl px-6 py-12 text-center">
        <h1 className="mb-4 text-6xl font-bold text-gray-900">
          🎯 TiKiT OS
        </h1>
        <p className="mb-4 text-2xl text-gray-700">
          Campaign Execution &amp; Intelligence Platform
        </p>
        <p className="mb-10 text-lg text-green-600 font-semibold">
          ✅ v1.0.0 — All Phases Complete — Production Ready
        </p>

        {/* All Phases Complete */}
        <div className="rounded-lg bg-white p-8 shadow-xl">
          <h2 className="mb-6 text-xl font-semibold text-gray-800">
            All 10 Phases Complete
          </h2>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 text-left">
            <PhaseCard title="Phase 0 — Foundation" done>
              <StatusItem checked>Turborepo monorepo</StatusItem>
              <StatusItem checked>Next.js 15 + TailwindCSS</StatusItem>
              <StatusItem checked>TypeScript strict mode</StatusItem>
            </PhaseCard>

            <PhaseCard title="Phase 1 — Backend" done>
              <StatusItem checked>Supabase + RLS policies</StatusItem>
              <StatusItem checked>tRPC API + auth</StatusItem>
              <StatusItem checked>14 DB tables, 13 migrations</StatusItem>
            </PhaseCard>

            <PhaseCard title="Phase 2 — Campaign Mgmt" done>
              <StatusItem checked>Campaigns &amp; Clients CRUD</StatusItem>
              <StatusItem checked>AI brief parsing (Gemini)</StatusItem>
              <StatusItem checked>Risk assessment logic</StatusItem>
            </PhaseCard>

            <PhaseCard title="Phase 3 — Web Frontend" done>
              <StatusItem checked>Dashboard with live data</StatusItem>
              <StatusItem checked>28 page routes</StatusItem>
              <StatusItem checked>14+ UI components</StatusItem>
            </PhaseCard>

            <PhaseCard title="Phase 4 — Approvals" done>
              <StatusItem checked>9 approval endpoints</StatusItem>
              <StatusItem checked>Multi-stage workflow</StatusItem>
              <StatusItem checked>Director override + audit trail</StatusItem>
            </PhaseCard>

            <PhaseCard title="Phase 5 — Creators" done>
              <StatusItem checked>Creator database + search</StatusItem>
              <StatusItem checked>Campaign shortlists</StatusItem>
              <StatusItem checked>Social stats &amp; engagement</StatusItem>
            </PhaseCard>

            <PhaseCard title="Phase 6 — Content" done>
              <StatusItem checked>3-gate approval pipeline</StatusItem>
              <StatusItem checked>Artifact version tracking</StatusItem>
              <StatusItem checked>Content task lifecycle</StatusItem>
            </PhaseCard>

            <PhaseCard title="Phase 7 — Finance" done>
              <StatusItem checked>Budgets, expenses, invoices</StatusItem>
              <StatusItem checked>Payment recording</StatusItem>
              <StatusItem checked>Financial KPI dashboard</StatusItem>
            </PhaseCard>

            <PhaseCard title="Phase 8 — Testing" done>
              <StatusItem checked>236+ unit &amp; integration tests</StatusItem>
              <StatusItem checked>E2E tests (Playwright)</StatusItem>
              <StatusItem checked>CI/CD pipeline (GitHub Actions)</StatusItem>
            </PhaseCard>

            <PhaseCard title="Phase 9 — Deployment" done>
              <StatusItem checked>Docker + Vercel ready</StatusItem>
              <StatusItem checked>Security headers &amp; CSP</StatusItem>
              <StatusItem checked>Rate limiting &amp; auth middleware</StatusItem>
            </PhaseCard>

            <PhaseCard title="Phase 10 — Polish" done className="sm:col-span-2 lg:col-span-2">
              <StatusItem checked>Production README + API docs</StatusItem>
              <StatusItem checked>Deployment guide</StatusItem>
              <StatusItem checked>Security audit &amp; hardening</StatusItem>
            </PhaseCard>
          </div>

          {/* Stats */}
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatCard number="28" label="Pages" />
            <StatCard number="12" label="API Routers" />
            <StatCard number="236+" label="Tests" />
            <StatCard number="60+" label="API Procedures" />
          </div>

          {/* CTA */}
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/dashboard"
              className="inline-block rounded-lg bg-blue-600 px-8 py-3 text-white font-medium hover:bg-blue-700 transition-colors"
            >
              Go to Dashboard →
            </Link>
            <Link
              href="/campaigns"
              className="inline-block rounded-lg border border-blue-600 px-8 py-3 text-blue-600 font-medium hover:bg-blue-50 transition-colors"
            >
              View Campaigns
            </Link>
            <Link
              href="/login"
              className="inline-block rounded-lg border border-gray-300 px-8 py-3 text-gray-600 font-medium hover:bg-gray-50 transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

/* ── tiny helper components ── */

function PhaseCard({
  title,
  done,
  className = '',
  children,
}: {
  title: string;
  done?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`rounded-lg border p-4 ${done ? 'border-green-200 bg-green-50' : 'border-gray-200'} ${className}`}>
      <h3 className="mb-2 font-semibold text-gray-900">{title}</h3>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function StatusItem({ checked, children }: { checked: boolean; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className={checked ? 'text-green-500' : 'text-gray-400'}>
        {checked ? '✓' : '○'}
      </span>
      <span className="text-gray-700">{children}</span>
    </div>
  );
}

function StatCard({ number, label }: { number: string; label: string }) {
  return (
    <div className="rounded-lg bg-blue-50 p-3 text-center">
      <div className="text-2xl font-bold text-blue-600">{number}</div>
      <div className="text-xs text-gray-600">{label}</div>
    </div>
  );
}
