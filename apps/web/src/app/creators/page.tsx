'use client';

import { trpc } from '@/lib/trpc';
import Link from 'next/link';
import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';

function formatFollowers(n: number | null | undefined): string {
  if (!n) return '-';
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

export default function CreatorsPage() {
  const [search, setSearch] = useState('');
  const [platform, setPlatform] = useState('');
  const [status, setStatus] = useState('');

  const { data, isLoading } = trpc.creators.list.useQuery({
    limit: 50,
    offset: 0,
    search: search || undefined,
    platform: platform ? (platform as 'instagram' | 'tiktok' | 'youtube' | 'twitter' | 'facebook' | 'other') : undefined,
    status: status ? (status as 'active' | 'inactive' | 'blacklisted') : undefined,
  });

  return (
    <AppLayout>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Creators</h1>
            <p className="mt-2 text-sm text-gray-600">
              Manage influencer and creator profiles for campaigns
            </p>
          </div>
          <Link href="/creators/new">
            <Button>
              <span className="mr-2">+</span>
              Add Creator
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Input
              placeholder="Search creators..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Select
              options={[
                { value: '', label: 'All Platforms' },
                { value: 'instagram', label: 'Instagram' },
                { value: 'tiktok', label: 'TikTok' },
                { value: 'youtube', label: 'YouTube' },
                { value: 'twitter', label: 'Twitter' },
                { value: 'facebook', label: 'Facebook' },
              ]}
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
            />
            <Select
              options={[
                { value: '', label: 'All Statuses' },
                { value: 'active', label: 'Active' },
                { value: 'inactive', label: 'Inactive' },
                { value: 'blacklisted', label: 'Blacklisted' },
              ]}
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            />
          </div>
        </Card>

        {/* Creators Grid */}
        {isLoading ? (
          <div className="py-12 text-center text-gray-500">Loading creators...</div>
        ) : data?.creators.length === 0 ? (
          <Card>
            <div className="py-12 text-center">
              <div className="text-4xl mb-4">🎬</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No creators found</h3>
              <p className="text-gray-600 mb-4">
                {search || platform || status
                  ? 'Try adjusting your filters'
                  : 'Get started by adding your first creator'}
              </p>
              {!search && !platform && !status && (
                <Link href="/creators/new">
                  <Button>Add First Creator</Button>
                </Link>
              )}
            </div>
          </Card>
        ) : (
          <>
            <div className="mb-4 text-sm text-gray-500">
              Showing {data?.creators.length} of {data?.total} creators
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {data?.creators.map((creator) => (
                <Link key={creator.id} href={`/creators/${creator.id}`}>
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                    <div className="flex items-start gap-4">
                      {/* Avatar */}
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-lg text-white font-bold">
                        {creator.name?.charAt(0).toUpperCase() || '?'}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-gray-900 truncate">{creator.name}</h3>
                        {creator.primary_platform && (
                          <Badge size="sm" variant="info" className="mt-1">
                            {creator.primary_platform}
                          </Badge>
                        )}
                      </div>
                      <Badge
                        size="sm"
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

                    {/* Social Stats */}
                    <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                      {creator.instagram_followers ? (
                        <div>
                          <div className="text-sm font-semibold text-gray-900">
                            {formatFollowers(creator.instagram_followers)}
                          </div>
                          <div className="text-xs text-gray-500">IG</div>
                        </div>
                      ) : null}
                      {creator.tiktok_followers ? (
                        <div>
                          <div className="text-sm font-semibold text-gray-900">
                            {formatFollowers(creator.tiktok_followers)}
                          </div>
                          <div className="text-xs text-gray-500">TikTok</div>
                        </div>
                      ) : null}
                      {creator.youtube_subscribers ? (
                        <div>
                          <div className="text-sm font-semibold text-gray-900">
                            {formatFollowers(creator.youtube_subscribers)}
                          </div>
                          <div className="text-xs text-gray-500">YouTube</div>
                        </div>
                      ) : null}
                    </div>

                    {/* Engagement & Niche */}
                    <div className="mt-4 border-t border-gray-100 pt-3">
                      {creator.avg_engagement_rate ? (
                        <div className="text-sm text-gray-600">
                          <span className="font-medium">{creator.avg_engagement_rate}%</span> engagement
                        </div>
                      ) : null}
                      {creator.niche && creator.niche.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {creator.niche.slice(0, 3).map((n: string) => (
                            <span
                              key={n}
                              className="inline-block rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600"
                            >
                              {n}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
}
