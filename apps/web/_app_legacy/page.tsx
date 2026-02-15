import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="bg-white">
      {/* Navigation */}
      <header className="absolute inset-x-0 top-0 z-50">
        <nav className="flex items-center justify-between p-6 lg:px-8" aria-label="Global">
          <div className="flex lg:flex-1">
            <a href="#" className="-m-1.5 p-1.5 text-2xl font-bold tracking-tight text-gray-900">
              TiKiT OS 🦖
            </a>
          </div>
          <div className="flex lg:justify-end gap-x-6">
            <Link href="/login" className="text-sm font-semibold leading-6 text-gray-900">
              Log in <span aria-hidden="true">&rarr;</span>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <div className="relative isolate px-6 pt-14 lg:px-8">
        <div className="mx-auto max-w-3xl py-32 sm:py-48 lg:py-56 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            Automate Your Agency. <br />
            <span className="text-green-600">Keep the Profits.</span>
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Most influencer tools charge you $500/mo just to find emails. 
            TiKiT OS automates the entire workflow—briefs, contracts, and payments—for a fraction of the cost.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link
              href="/login"
              className="rounded-md bg-green-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600"
            >
              Get Early Access
            </Link>
            <a href="#features" className="text-sm font-semibold leading-6 text-gray-900">
              Learn more <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>
      </div>

      {/* Feature Section */}
      <div id="features" className="bg-gray-50 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-base font-semibold leading-7 text-green-600">Engineering-Grade Workflow</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Stop Managing Chaos. Start Building Systems.
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-2 lg:gap-y-16">
              <div className="relative pl-16">
                <dt className="text-base font-semibold leading-7 text-gray-900">
                  <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-green-600 text-white">
                    🚀
                  </div>
                  AI-Powered Briefs
                </dt>
                <dd className="mt-2 text-base leading-7 text-gray-600">
                  Generate perfect campaign briefs in seconds. Our AI analyzes the brand and the influencer to suggest the best angle.
                </dd>
              </div>
              <div className="relative pl-16">
                <dt className="text-base font-semibold leading-7 text-gray-900">
                  <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-green-600 text-white">
                    💰
                  </div>
                  Smart Negotiation
                </dt>
                <dd className="mt-2 text-base leading-7 text-gray-600">
                  Stop overpaying. TiKiT predicts the fair market rate for every influencer based on real engagement data.
                </dd>
              </div>
              <div className="relative pl-16">
                <dt className="text-base font-semibold leading-7 text-gray-900">
                  <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-green-600 text-white">
                    📊
                  </div>
                  Real-Time ROI
                </dt>
                <dd className="mt-2 text-base leading-7 text-gray-600">
                  Track clicks, conversions, and sales automatically. No more manual spreadsheets.
                </dd>
              </div>
              <div className="relative pl-16">
                <dt className="text-base font-semibold leading-7 text-gray-900">
                  <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-green-600 text-white">
                    🤝
                  </div>
                  Direct Contracts
                </dt>
                <dd className="mt-2 text-base leading-7 text-gray-600">
                  Send, sign, and store contracts within the platform. Legal protection built-in.
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
