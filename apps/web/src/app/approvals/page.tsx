'use client';

import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { ApprovalCard } from '@/components/approvals/ApprovalCard';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { trpc } from '@/lib/trpc';
import type { ApprovalWithRelations } from '@/types/api';

export default function ApprovalsPage() {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const { data: approvals, isLoading } = trpc.approvals.list.useQuery({
    status: statusFilter !== 'all' ? (statusFilter as any) : undefined,
    type: typeFilter !== 'all' ? (typeFilter as any) : undefined,
  }) as { data: ApprovalWithRelations[] | undefined; isLoading: boolean };

  const filteredApprovals = approvals?.filter((approval) => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      approval.campaigns?.name.toLowerCase().includes(searchLower) ||
      approval.approval_type.toLowerCase().includes(searchLower)
    );
  });

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">All Approvals</h1>
          <p className="text-gray-600 mt-2">
            Manage and track all approval requests across campaigns
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by campaign or type..."
            />
            <Select
              label="Status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="overridden">Overridden</option>
            </Select>
            <Select
              label="Type"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="all">All Types</option>
              <option value="brief">Brief</option>
              <option value="strategy">Strategy</option>
              <option value="shortlist">Shortlist</option>
              <option value="content">Content</option>
              <option value="budget_revision">Budget Revision</option>
            </Select>
          </div>
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading approvals...</p>
          </div>
        ) : filteredApprovals && filteredApprovals.length > 0 ? (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Showing {filteredApprovals.length} approval{filteredApprovals.length !== 1 ? 's' : ''}
            </p>
            {filteredApprovals.map((approval) => (
              <ApprovalCard key={approval.id} approval={approval} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg">
            <p className="text-gray-500 text-lg">No approvals found</p>
            <p className="text-gray-400 mt-2">
              {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'Approval requests will appear here'}
            </p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
