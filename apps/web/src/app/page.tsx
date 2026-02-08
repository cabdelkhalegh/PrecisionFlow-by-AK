import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="mx-auto max-w-4xl px-6 py-12 text-center">
        <h1 className="mb-4 text-6xl font-bold text-gray-900">
          🎯 TiKiT OS
        </h1>
        <p className="mb-10 text-2xl text-gray-700">
          Campaign Execution &amp; Intelligence Platform
        </p>

        {/* Completed Phases */}
        <div className="rounded-lg bg-white p-8 shadow-xl">
          <h2 className="mb-6 text-xl font-semibold text-gray-800">
            ✅ Phases 0 – 4 Complete
          </h2>

          <div className="grid gap-6 sm:grid-cols-2 text-left">
            {/* Phase 0 */}
            <PhaseCard title="Phase 0 — Foundation" done>
              <StatusItem checked>Turborepo monorepo</StatusItem>
              <StatusItem checked>Next.js 15 + TailwindCSS</StatusItem>
              <StatusItem checked>TypeScript strict mode</StatusItem>
            </PhaseCard>

            {/* Phase 1 */}
            <PhaseCard title="Phase 1 — Backend" done>
              <StatusItem checked>Supabase + RLS policies</StatusItem>
              <StatusItem checked>tRPC API + auth</StatusItem>
              <StatusItem checked>13 DB migrations</StatusItem>
            </PhaseCard>

            {/* Phase 2 */}
            <PhaseCard title="Phase 2 — Campaign Mgmt" done>
              <StatusItem checked>Campaigns &amp; Clients CRUD</StatusItem>
              <StatusItem checked>Briefs upload &amp; AI parsing</StatusItem>
              <StatusItem checked>Risk assessment logic</StatusItem>
            </PhaseCard>

            {/* Phase 3 */}
            <PhaseCard title="Phase 3 — Web Frontend" done>
              <StatusItem checked>Dashboard &amp; layout</StatusItem>
              <StatusItem checked>Campaign &amp; client pages</StatusItem>
              <StatusItem checked>14+ UI components</StatusItem>
            </PhaseCard>

            {/* Phase 4 */}
            <PhaseCard title="Phase 4 — Approvals" done className="sm:col-span-2">
              <StatusItem checked>9 approval endpoints</StatusItem>
              <StatusItem checked>Multi-stage workflow</StatusItem>
              <StatusItem checked>Director override &amp; audit trail</StatusItem>
            </PhaseCard>
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
          </div>
        </div>

        {/* What's Next */}
        <div className="mt-8 rounded-lg bg-white p-8 shadow-xl text-left">
          <h2 className="mb-4 text-xl font-semibold text-gray-800">
            🚀 What&apos;s Next
          </h2>
          <div className="space-y-3">
            <NextStep number={5} title="Mobile App Foundation">
              Expo / React Native companion app
            </NextStep>
            <NextStep number={6} title="Content &amp; Creator Management">
              Creator profiles, content task lifecycle, shortlist approval
            </NextStep>
            <NextStep number={7} title="Financial Tracking">
              Budgets, invoices, payment status, revenue reporting
            </NextStep>
            <NextStep number={8} title="Testing &amp; QA">
              Unit, integration &amp; E2E tests — 80%+ coverage target
            </NextStep>
            <NextStep number={9} title="Deployment &amp; CI/CD">
              GitHub Actions pipeline, Vercel / Docker production deploy
            </NextStep>
            <NextStep number={10} title="Documentation &amp; Polish">
              User guides, admin docs, performance tuning
            </NextStep>
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

function NextStep({
  number,
  title,
  children,
}: {
  number: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700">
        {number}
      </span>
      <div>
        <p className="font-medium text-gray-900">{title}</p>
        <p className="text-sm text-gray-500">{children}</p>
      </div>
    </div>
  );
}
