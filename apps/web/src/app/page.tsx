import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
            backgroundSize: '40px 40px',
          }}
        />
        <nav className="relative mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div className="text-2xl font-bold text-white">PrecisionFlow</div>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-medium text-blue-100 hover:text-white"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="rounded-lg bg-white px-5 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50 transition-colors"
            >
              Get Started
            </Link>
          </div>
        </nav>
        <div className="relative mx-auto max-w-7xl px-6 pb-24 pt-16 sm:pb-32 sm:pt-24 text-center">
          <div className="inline-flex items-center rounded-full bg-blue-500/30 px-4 py-1.5 text-sm text-blue-100 mb-8 backdrop-blur-sm">
            Powered by AI &mdash; Built for Agencies
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-6xl lg:text-7xl">
            Influencer Campaigns,
            <br />
            <span className="text-blue-200">Precision-Engineered</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-blue-100 sm:text-xl">
            The AI-powered operating system for influencer marketing agencies.
            From brief to billing, every campaign step is tracked, optimized,
            and intelligent.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/signup"
              className="rounded-lg bg-white px-8 py-3.5 text-base font-semibold text-blue-700 shadow-lg hover:bg-blue-50 transition-colors"
            >
              Start Free Trial
            </Link>
            <Link
              href="/login"
              className="rounded-lg border-2 border-white/30 px-8 py-3.5 text-base font-semibold text-white hover:bg-white/10 transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="border-b border-gray-100 bg-gray-50 py-6">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-8 px-6 sm:gap-16">
          <Stat value="7" label="AI Modules" />
          <Stat value="30+" label="Pages" />
          <Stat value="60+" label="API Endpoints" />
          <Stat value="170+" label="Tests Passing" />
        </div>
      </section>

      {/* AI Features */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              AI-Powered Campaign Intelligence
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
              7 advanced AI modules powered by Google Gemini that transform how
              you plan, execute, and learn from influencer campaigns.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon="&#x1F9E0;"
              title="Strategy Generator"
              description="Generate complete campaign strategies from brief data — content pillars, posting schedules, audience targeting, and budget allocation."
              color="blue"
            />
            <FeatureCard
              icon="&#x1F3AF;"
              title="Smart Creator Matching"
              description="AI scores and ranks creators across 6 dimensions: audience fit, niche alignment, engagement quality, rate efficiency, and more."
              color="purple"
            />
            <FeatureCard
              icon="&#x1F4C8;"
              title="Performance Predictor"
              description="Predict reach, engagement, and ROI before content goes live. Get confidence intervals and optimization tips."
              color="green"
            />
            <FeatureCard
              icon="&#x2705;"
              title="Content Reviewer"
              description="AI-powered content review for brand safety, brief alignment, sentiment analysis, and quality scoring."
              color="orange"
            />
            <FeatureCard
              icon="&#x1F6E1;&#xFE0F;"
              title="Risk Intelligence"
              description="Continuous monitoring of budget burn rate, timeline risks, approval bottlenecks, and creator delivery patterns."
              color="red"
            />
            <FeatureCard
              icon="&#x1F4DA;"
              title="Learning Engine"
              description="Extract post-campaign learnings, success patterns, creator performance reviews, and repeat-campaign blueprints."
              color="indigo"
            />
          </div>
        </div>
      </section>

      {/* Platform Features */}
      <section className="bg-gray-50 py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Everything You Need, One Platform
            </h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <PlatformCard
              icon="&#x1F4CB;"
              title="Campaign Management"
              items={[
                'Full lifecycle tracking',
                'Multi-stage workflows',
                'Brief parsing with AI',
              ]}
            />
            <PlatformCard
              icon="&#x1F3AC;"
              title="Creator Database"
              items={[
                'Profile management',
                'Social stats tracking',
                'Campaign shortlisting',
              ]}
            />
            <PlatformCard
              icon="&#x2713;"
              title="Approval Workflows"
              items={[
                'Multi-gate reviews',
                'Director overrides',
                'Full audit trail',
              ]}
            />
            <PlatformCard
              icon="&#x1F4B0;"
              title="Finance &amp; Billing"
              items={[
                'Budget tracking',
                'Expense management',
                'Invoice generation',
              ]}
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Ready to supercharge your campaigns?
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Join agencies using AI to plan smarter, execute faster, and learn
            from every campaign.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/signup"
              className="rounded-lg bg-blue-600 px-8 py-3.5 text-base font-semibold text-white shadow-lg hover:bg-blue-700 transition-colors"
            >
              Get Started Free
            </Link>
            <Link
              href="/login"
              className="rounded-lg border-2 border-gray-300 px-8 py-3.5 text-base font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-gray-50 py-8">
        <div className="mx-auto max-w-7xl px-6 text-center text-sm text-gray-500">
          PrecisionFlow &mdash; Campaign Execution &amp; Intelligence Platform
        </div>
      </footer>
    </main>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className="text-sm text-gray-500">{label}</div>
    </div>
  );
}

const colorMap: Record<string, string> = {
  blue: 'bg-blue-50 border-blue-200',
  purple: 'bg-purple-50 border-purple-200',
  green: 'bg-green-50 border-green-200',
  orange: 'bg-orange-50 border-orange-200',
  red: 'bg-red-50 border-red-200',
  indigo: 'bg-indigo-50 border-indigo-200',
};

function FeatureCard({
  icon,
  title,
  description,
  color,
}: {
  icon: string;
  title: string;
  description: string;
  color: string;
}) {
  return (
    <div className={`rounded-xl border-2 p-6 ${colorMap[color]}`}>
      <div className="text-3xl mb-3">{icon}</div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
    </div>
  );
}

function PlatformCard({
  icon,
  title,
  items,
}: {
  icon: string;
  title: string;
  items: string[];
}) {
  return (
    <div className="rounded-xl bg-white border border-gray-200 p-6 shadow-sm">
      <div className="text-2xl mb-3">{icon}</div>
      <h3 className="text-base font-semibold text-gray-900 mb-3">{title}</h3>
      <ul className="space-y-1.5">
        {items.map((item, i) => (
          <li
            key={i}
            className="flex items-center gap-2 text-sm text-gray-600"
          >
            <span className="text-green-500 text-xs">&#10003;</span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
