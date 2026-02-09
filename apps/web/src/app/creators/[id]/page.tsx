'use client';

import { trpc } from '@/lib/trpc';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

function formatFollowers(n: number | null | undefined): string {
  if (!n) return '0';
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

export default function CreatorDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const { data: creator, isLoading, error } = trpc.creators.getById.useQuery({ id });

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="text-gray-500">Loading creator profile...</div>
        </div>
      </AppLayout>
    );
  }

  if (error || !creator) {
    return (
      <AppLayout>
        <div className="mx-auto max-w-3xl px-4 py-16 text-center">
          <div className="text-4xl mb-4">🔍</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Creator not found</h2>
          <p className="text-gray-600 mb-6">This creator profile may have been removed.</p>
          <Link href="/creators">
            <Button>Back to Creators</Button>
          </Link>
        </div>
      </AppLayout>
    );
  }

  const socials = [
    { label: 'Instagram', handle: creator.instagram_handle, followers: creator.instagram_followers, icon: '📸' },
    { label: 'TikTok', handle: creator.tiktok_handle, followers: creator.tiktok_followers, icon: '🎵' },
    { label: 'YouTube', handle: creator.youtube_handle, followers: creator.youtube_subscribers, icon: '🎬' },
    { label: 'Twitter', handle: creator.twitter_handle, followers: creator.twitter_followers, icon: '🐦' },
  ].filter((s) => s.handle);

  return (
    <AppLayout>
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Back link */}
        <Link href="/creators" className="mb-6 inline-flex items-center text-sm text-gray-500 hover:text-gray-700">
          ← Back to Creators
        </Link>

        {/* Header Card */}
        <Card className="mb-6">
          <div className="flex items-start gap-6">
            {/* Avatar */}
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-3xl text-white font-bold">
              {creator.name?.charAt(0).toUpperCase() || '?'}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-900">{creator.name}</h1>
                {creator.verified && (
                  <span className="text-blue-500" title="Verified">✓</span>
                )}
                <Badge
                  variant={
                    creator.status === 'active'
                      ? 'success'
                      : creator.status === 'blacklisted'
                        ? 'danger'
                        : 'default'
                  }
                >
                  {creator.status || 'active'}
                </Badge>
              </div>
              {creator.bio && (
                <p className="mt-2 text-gray-600">{creator.bio}</p>
              )}
              {creator.primary_platform && (
                <div className="mt-2">
                  <Badge size="sm" variant="info">
                    Primary: {creator.primary_platform}
                  </Badge>
                </div>
              )}
              {creator.city || creator.country ? (
                <p className="mt-2 text-sm text-gray-500">
                  📍 {[creator.city, creator.country].filter(Boolean).join(', ')}
                </p>
              ) : null}
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Social Platforms */}
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Social Platforms</h2>
            {socials.length === 0 ? (
              <p className="text-gray-500 text-sm">No social handles added.</p>
            ) : (
              <div className="space-y-4">
                {socials.map((s) => (
                  <div key={s.label} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{s.icon}</span>
                      <div>
                        <div className="font-medium text-gray-900">{s.label}</div>
                        <div className="text-sm text-gray-500">{s.handle}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-gray-900">
                        {formatFollowers(s.followers)}
                      </div>
                      <div className="text-xs text-gray-500">followers</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Engagement & Stats */}
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Engagement</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg bg-blue-50 p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {creator.avg_engagement_rate ? `${creator.avg_engagement_rate}%` : '-'}
                </div>
                <div className="text-sm text-gray-600">Engagement Rate</div>
              </div>
              <div className="rounded-lg bg-green-50 p-4 text-center">
                <div className="text-2xl font-bold text-green-600">
                  {creator.total_campaigns_completed || 0}
                </div>
                <div className="text-sm text-gray-600">Campaigns</div>
              </div>
              <div className="rounded-lg bg-purple-50 p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {formatFollowers(creator.avg_views)}
                </div>
                <div className="text-sm text-gray-600">Avg Views</div>
              </div>
              <div className="rounded-lg bg-orange-50 p-4 text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {formatFollowers(creator.avg_likes)}
                </div>
                <div className="text-sm text-gray-600">Avg Likes</div>
              </div>
            </div>
          </Card>

          {/* Contact Info */}
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact</h2>
            <div className="space-y-3">
              {creator.email && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-400">✉</span>
                  <span className="text-gray-700">{creator.email}</span>
                </div>
              )}
              {creator.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-400">📱</span>
                  <span className="text-gray-700">{creator.phone}</span>
                </div>
              )}
              {!creator.email && !creator.phone && (
                <p className="text-sm text-gray-500">No contact info available.</p>
              )}
            </div>
          </Card>

          {/* Niche & Tags */}
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Niche &amp; Tags</h2>
            {creator.niche && creator.niche.length > 0 ? (
              <div className="flex flex-wrap gap-2 mb-4">
                {creator.niche.map((n: string) => (
                  <Badge key={n} size="sm" variant="info">
                    {n}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 mb-4">No niches set.</p>
            )}
            {creator.content_types && creator.content_types.length > 0 && (
              <>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Content Types</h3>
                <div className="flex flex-wrap gap-2">
                  {creator.content_types.map((ct: string) => (
                    <span
                      key={ct}
                      className="inline-block rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600"
                    >
                      {ct}
                    </span>
                  ))}
                </div>
              </>
            )}
          </Card>
        </div>

        {/* Notes */}
        {creator.notes && (
          <Card className="mt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Notes</h2>
            <p className="text-gray-600 whitespace-pre-wrap">{creator.notes}</p>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
