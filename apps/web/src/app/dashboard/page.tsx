export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">🎯</span>
              <h1 className="text-2xl font-bold text-gray-900">TiKiT OS</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Campaign Manager</span>
              <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                CM
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Welcome to TiKiT OS Dashboard
          </h2>
          <p className="text-gray-600">
            Campaign Execution & Intelligence Platform - Successfully Running
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <StatCard 
            title="Active Campaigns" 
            value="0" 
            icon="📊"
            color="blue"
          />
          <StatCard 
            title="Pending Approvals" 
            value="0" 
            icon="✅"
            color="yellow"
          />
          <StatCard 
            title="Active Creators" 
            value="0" 
            icon="👥"
            color="green"
          />
          <StatCard 
            title="Total Budget" 
            value="$0" 
            icon="💰"
            color="purple"
          />
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ActionButton 
              icon="➕"
              title="New Campaign"
              description="Create a new campaign"
            />
            <ActionButton 
              icon="📝"
              title="Review Briefs"
              description="Review pending briefs"
            />
            <ActionButton 
              icon="🎬"
              title="Content Tasks"
              description="Manage content tasks"
            />
          </div>
        </div>

        {/* System Status */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
          <div className="space-y-3">
            <StatusItem label="Web Application" status="running" />
            <StatusItem label="Database Connection" status="ready" />
            <StatusItem label="AI Services" status="configured" />
            <StatusItem label="Authentication" status="ready" />
          </div>
        </div>
      </main>
    </div>
  )
}

function StatCard({ title, value, icon, color }: { 
  title: string
  value: string
  icon: string
  color: 'blue' | 'yellow' | 'green' | 'purple'
}) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-700',
    yellow: 'bg-yellow-50 text-yellow-700',
    green: 'bg-green-50 text-green-700',
    purple: 'bg-purple-50 text-purple-700',
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-2">
        <span className="text-2xl">{icon}</span>
        <span className={`text-xs font-semibold px-2 py-1 rounded ${colorClasses[color]}`}>
          Active
        </span>
      </div>
      <div className="text-2xl font-bold text-gray-900 mb-1">{value}</div>
      <div className="text-sm text-gray-600">{title}</div>
    </div>
  )
}

function ActionButton({ icon, title, description }: {
  icon: string
  title: string
  description: string
}) {
  return (
    <button className="flex items-start space-x-3 p-4 rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors text-left">
      <span className="text-2xl">{icon}</span>
      <div>
        <div className="font-semibold text-gray-900">{title}</div>
        <div className="text-sm text-gray-600">{description}</div>
      </div>
    </button>
  )
}

function StatusItem({ label, status }: { label: string; status: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-gray-700">{label}</span>
      <div className="flex items-center space-x-2">
        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
        <span className="text-sm text-green-700 font-medium capitalize">{status}</span>
      </div>
    </div>
  )
}
