'use client';

import React, { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { trpc } from '@/lib/trpc';
import Link from 'next/link';

const ENTITY_TYPES = [
  { value: '', label: 'All Entities' },
  { value: 'campaigns', label: 'Campaigns' },
  { value: 'clients', label: 'Clients' },
  { value: 'creators', label: 'Creators' },
  { value: 'briefs', label: 'Briefs' },
  { value: 'approvals', label: 'Approvals' },
  { value: 'content_tasks', label: 'Content Tasks' },
  { value: 'content_artifacts', label: 'Artifacts' },
  { value: 'campaign_shortlists', label: 'Shortlists' },
];

const OPERATIONS = [
  { value: '', label: 'All Actions' },
  { value: 'INSERT', label: 'Created' },
  { value: 'UPDATE', label: 'Updated' },
  { value: 'DELETE', label: 'Deleted' },
];

const ENTITY_ICONS: Record<string, string> = {
  campaigns: '📋',
  clients: '👥',
  creators: '🎬',
  briefs: '📄',
  approvals: '✅',
  content_tasks: '📝',
  content_artifacts: '📎',
  campaign_shortlists: '🎯',
  campaign_members: '👤',
  users: '🔒',
};

const OPERATION_COLORS: Record<string, 'success' | 'info' | 'danger' | 'default'> = {
  INSERT: 'success',
  UPDATE: 'info',
  DELETE: 'danger',
};

const OPERATION_LABELS: Record<string, string> = {
  INSERT: 'Created',
  UPDATE: 'Updated',
  DELETE: 'Deleted',
};

export default function ActivityFeedPage() {
  const [entityFilter, setEntityFilter] = useState('');
  const [operationFilter, setOperationFilter] = useState('');
  const [page, setPage] = useState(0);
  const pageSize = 25;

  const { data, isLoading } = trpc.activityLogs.list.useQuery({
    limit: pageSize,
    offset: page * pageSize,
    tableName: entityFilter || undefined,
    operation: (operationFilter as 'INSERT' | 'UPDATE' | 'DELETE') || undefined,
  });

  const { data: summary } = trpc.activityLogs.summary.useQuery();

  const logs = data?.logs || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / pageSize);

  const getEntityLink = (tableName: string, recordId: string): string | null => {
    switch (tableName) {
      case 'campaigns': return `/campaigns/${recordId}`;
      case 'clients': return `/clients/${recordId}`;
      case 'creators': return `/creators/${recordId}`;
      default: return null;
    }
  };

  const getChangeSummary = (log: any): string => {
    if (log.operation === 'INSERT') {
      const name = log.new_data?.name || log.new_data?.title || '';
      return name ? `Created "${name}"` : 'New record created';
    }
    if (log.operation === 'DELETE') {
      const name = log.old_data?.name || log.old_data?.title || '';
      return name ? `Deleted "${name}"` : 'Record deleted';
    }
    // UPDATE — show changed fields
    if (log.changed_fields && Array.isArray(log.changed_fields) && log.changed_fields.length > 0) {
      const fields = log.changed_fields.filter(
        (f: string) => f !== 'updated_at' && f !== 'created_at'
      );
      if (fields.length === 0) return 'Metadata updated';
      if (fields.length <= 3) return `Updated ${fields.join(', ')}`;
      return `Updated ${fields.slice(0, 3).join(', ')} and ${fields.length - 3} more`;
    }
    return 'Record updated';
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    const diffHr = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHr / 24);

    if (diffMin < 1) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHr < 24) return `${diffHr}h ago`;
    if (diffDay < 7) return `${diffDay}d ago`;
    return d.toLocaleDateString();
  };

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Activity Feed</h1>
            <p className="text-gray-600 mt-1">
              Real-time audit trail of all changes across the platform
            </p>
          </div>
          <Badge variant="info">{total} events</Badge>
        </div>

        {/* Summary Cards */}
        {summary && Object.keys(summary).length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {Object.entries(summary)
              .sort(([, a], [, b]) => (b as number) - (a as number))
              .slice(0, 8)
              .map(([table, count]) => (
                <Card key={table}>
                  <div className="text-center">
                    <div className="text-lg">{ENTITY_ICONS[table] || '📦'}</div>
                    <div className="text-xl font-bold text-gray-900">{count as number}</div>
                    <div className="text-xs text-gray-500 capitalize">
                      {table.replace(/_/g, ' ')}
                    </div>
                  </div>
                </Card>
              ))}
          </div>
        )}

        {/* Filters */}
        <Card className="mb-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[180px]">
              <Select
                label="Entity Type"
                value={entityFilter}
                onChange={(e) => {
                  setEntityFilter(e.target.value);
                  setPage(0);
                }}
              >
                {ENTITY_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </Select>
            </div>
            <div className="flex-1 min-w-[180px]">
              <Select
                label="Action"
                value={operationFilter}
                onChange={(e) => {
                  setOperationFilter(e.target.value);
                  setPage(0);
                }}
              >
                {OPERATIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </Select>
            </div>
          </div>
        </Card>

        {/* Timeline */}
        {isLoading ? (
          <Card>
            <div className="py-12 text-center text-gray-500">Loading activity...</div>
          </Card>
        ) : logs.length === 0 ? (
          <Card>
            <div className="py-12 text-center">
              <div className="text-4xl mb-4">📭</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No activity yet</h3>
              <p className="text-gray-600">
                Changes to campaigns, clients, creators, and other entities will appear here.
              </p>
            </div>
          </Card>
        ) : (
          <div className="space-y-3">
            {logs.map((log: any) => {
              const link = getEntityLink(log.table_name, log.record_id);
              return (
                <Card key={log.id} className="hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-4">
                    {/* Entity icon */}
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100 text-lg">
                      {ENTITY_ICONS[log.table_name] || '📦'}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge
                          size="sm"
                          variant={OPERATION_COLORS[log.operation] || 'default'}
                        >
                          {OPERATION_LABELS[log.operation] || log.operation}
                        </Badge>
                        <span className="text-sm font-medium text-gray-700 capitalize">
                          {log.table_name.replace(/_/g, ' ')}
                        </span>
                        {link && (
                          <Link
                            href={link}
                            className="text-blue-600 hover:underline text-sm"
                          >
                            View →
                          </Link>
                        )}
                      </div>
                      <p className="text-sm text-gray-900">{getChangeSummary(log)}</p>
                      {log.user_id && (
                        <p className="text-xs text-gray-400 mt-1">
                          by {log.user_id.slice(0, 8)}…
                        </p>
                      )}
                    </div>

                    {/* Timestamp */}
                    <div className="shrink-0 text-right">
                      <span className="text-xs text-gray-500">
                        {formatTime(log.created_at)}
                      </span>
                    </div>
                  </div>
                </Card>
              );
            })}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-4">
                <Button
                  variant="secondary"
                  disabled={page === 0}
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                >
                  ← Previous
                </Button>
                <span className="text-sm text-gray-500">
                  Page {page + 1} of {totalPages}
                </span>
                <Button
                  variant="secondary"
                  disabled={page >= totalPages - 1}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next →
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
