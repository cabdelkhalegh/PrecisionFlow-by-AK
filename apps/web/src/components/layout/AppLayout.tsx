'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/lib/auth-provider';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: '📊' },
  { name: 'Campaigns', href: '/campaigns', icon: '📋' },
  { name: 'Clients', href: '/clients', icon: '👥' },
  { name: 'Creators', href: '/creators', icon: '🎬' },
  { name: 'Briefs', href: '/briefs', icon: '📄' },
  { name: 'Approvals', href: '/approvals', icon: '✓', showBadge: true },
  { name: 'Finance', href: '/finance', icon: '💰' },
  { name: 'Reports', href: '/reports', icon: '📈' },
  { name: 'Activity', href: '/activity', icon: '🔔' },
  { name: 'Settings', href: '/settings', icon: '⚙️' },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { data: pendingCount } = trpc.approvals.countPending.useQuery();

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Guest';
  const initials = displayName
    .split(' ')
    .map((w: string) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between">
            <div className="flex">
              {/* Logo */}
              <div className="flex flex-shrink-0 items-center">
                <Link href="/dashboard" className="text-xl font-bold text-yellow-600">
                  🦖 Ubuntu TiKiT OS
                </Link>
                <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 border border-yellow-300 px-2 py-1 rounded-full font-bold shadow-sm">
                  GOLD
                </span>
              </div>
              {/* Navigation Links */}
              <div className="ml-6 flex space-x-8">
                {navigation.map((item) => {
                  const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
                  const showCount = item.showBadge && pendingCount && pendingCount > 0;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium relative ${
                        isActive
                          ? 'border-yellow-500 text-gray-900'
                          : 'border-transparent text-gray-500 hover:border-yellow-300 hover:text-gray-700'
                      }`}
                    >
                      <span className="mr-2">{item.icon}</span>
                      {item.name}
                      {showCount && (
                        <span className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-yellow-900 bg-yellow-400 rounded-full border border-yellow-500 shadow-sm">
                          {pendingCount}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
            {/* User Menu */}
            <div className="flex items-center gap-3">
              {user ? (
                <>
                  <div className="flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-2">
                    <span className="text-sm text-gray-700">{displayName}</span>
                    <div className="h-8 w-8 rounded-full bg-yellow-400 flex items-center justify-center text-yellow-900 text-sm font-bold border border-yellow-500">
                      {initials}
                    </div>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  className="rounded-md bg-yellow-600 px-3 py-2 text-sm font-bold text-white shadow-sm hover:bg-yellow-700 border border-yellow-700"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main>{children}</main>
    </div>
  );
}
