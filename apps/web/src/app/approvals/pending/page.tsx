'use client';

import { AppLayout } from '@/components/layout/AppLayout';
import { ApprovalCard } from '@/components/approvals/ApprovalCard';
import { Badge } from '@/components/ui/Badge';
import { trpc } from '@/lib/trpc';

export default function PendingApprovalsPage() {
  const { data: approvals, isLoading, refetch } = trpc.approvals.getPendingForUser.useQuery();

  const handleUpdate = () => {
    refetch();
  };

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-gray-900">My Pending Approvals</h1>
            {approvals && approvals.length > 0 && (
              <Badge variant="warning">{approvals.length}</Badge>
            )}
          </div>
          <p className="text-gray-600 mt-2">
            Review and action approval requests assigned to you
          </p>
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading your pending approvals...</p>
          </div>
        ) : approvals && approvals.length > 0 ? (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              You have {approvals.length} pending approval{approvals.length !== 1 ? 's' : ''}
            </p>
            {approvals.map((approval) => (
              <ApprovalCard
                key={approval.id}
                approval={approval}
                showActions={true}
                onUpdate={handleUpdate}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg">
            <p className="text-gray-500 text-lg">No pending approvals</p>
            <p className="text-gray-400 mt-2">
              You&apos;re all caught up! Approval requests will appear here.
            </p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
