'use client';

import React from 'react';
import { trpc } from '@/lib/trpc';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

interface CampaignPipelineBoardProps {
  campaignId: string;
}

export function CampaignPipelineBoard({ campaignId }: CampaignPipelineBoardProps) {
  // Fetch Shortlist (Proposed -> Approved)
  const { data: shortlist, isLoading: loadingShortlist } = trpc.shortlists.getByCampaign.useQuery(
    { campaign_id: campaignId },
    { enabled: !!campaignId }
  );

  // Fetch Tasks (In Production -> Live)
  const { data: tasks, isLoading: loadingTasks } = trpc.contentTasks.getByCampaign.useQuery(
    { campaign_id: campaignId },
    { enabled: !!campaignId }
  );

  if (loadingShortlist || loadingTasks) {
    return <div className="p-8 text-center text-gray-500">Loading pipeline...</div>;
  }

  // --- Process Columns ---

  // 1. Proposed (Shortlist: draft, submitted)
  const proposedItems = (shortlist || []).filter(item => 
    ['draft', 'submitted'].includes(item.status)
  );

  // 2. Approved (Shortlist: approved)
  // These are creators approved but not yet assigned a specific content task
  // (Assuming creating a task moves them out of this list or into the next stage conceptually)
  // For simplicity: Show approved shortlist items here.
  const approvedItems = (shortlist || []).filter(item => 
    item.status === 'approved'
  );

  // 3. In Production (Tasks: assigned, in_progress, review)
  const productionTasks = (tasks || []).filter(task => 
    !['published', 'completed', 'cancelled'].includes(task.status)
  );

  // 4. Live / Done (Tasks: published, completed)
  const completedTasks = (tasks || []).filter(task => 
    ['published', 'completed'].includes(task.status)
  );

  const columns = [
    { title: 'Proposed', items: proposedItems, type: 'shortlist', color: 'bg-gray-50' },
    { title: 'Approved', items: approvedItems, type: 'shortlist', color: 'bg-blue-50' },
    { title: 'In Production', items: productionTasks, type: 'task', color: 'bg-yellow-50' },
    { title: 'Live / Done', items: completedTasks, type: 'task', color: 'bg-green-50' },
  ];

  return (
    <div className="overflow-x-auto pb-4">
      <div className="flex gap-4 min-w-[1000px]">
        {columns.map((col) => (
          <div key={col.title} className={`flex-1 min-w-[240px] rounded-lg p-3 ${col.color}`}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-700">{col.title}</h3>
              <Badge variant="secondary">{col.items.length}</Badge>
            </div>
            
            <div className="space-y-3">
              {col.items.length === 0 && (
                <div className="text-sm text-gray-400 text-center py-4 italic">
                  No items
                </div>
              )}

              {col.items.map((item: any) => (
                <Card key={item.id} className="p-3 bg-white shadow-sm hover:shadow-md transition-shadow">
                  {col.type === 'shortlist' ? (
                    // Shortlist Item Card
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-medium text-gray-900 truncate">
                          {item.creator?.name || 'Unknown'}
                        </span>
                        {item.creator?.primary_platform && (
                          <Badge size="sm" variant="outline">{item.creator.primary_platform}</Badge>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 mb-2">
                        Rate: ${item.proposed_rate?.toLocaleString() ?? '-'}
                      </div>
                      <div className="flex justify-end gap-1">
                         {/* Conceptual Actions */}
                         {item.status === 'draft' && (
                           <Button size="sm" variant="secondary" className="text-xs h-7">Submit</Button>
                         )}
                         {item.status === 'submitted' && (
                           <Button size="sm" variant="primary" className="text-xs h-7">Approve</Button>
                         )}
                         {item.status === 'approved' && (
                           <Button size="sm" variant="primary" className="text-xs h-7">Create Task</Button>
                         )}
                      </div>
                    </div>
                  ) : (
                    // Task Item Card
                    <Link href={`/campaigns/${campaignId}/tasks/${item.id}`} className="block">
                      <div className="mb-1">
                        <h4 className="font-medium text-gray-900 text-sm truncate">{item.title}</h4>
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                         <span className="text-xs text-gray-500">
                           {item.creator?.name}
                         </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <Badge size="sm" variant={getStatusColor(item.status)}>
                          {item.status?.replace(/_/g, ' ')}
                        </Badge>
                        {item.final_deadline && (
                           <span className="text-xs text-red-500">
                             Due {new Date(item.final_deadline).toLocaleDateString(undefined, {month:'short', day:'numeric'})}
                           </span>
                        )}
                      </div>
                    </Link>
                  )}
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function getStatusColor(status: string) {
    switch (status) {
      case 'assigned': return 'default';
      case 'script_submitted': case 'draft_submitted': return 'info';
      case 'script_approved': case 'draft_approved': return 'success';
      case 'changes_requested': return 'warning';
      case 'approved': case 'published': return 'success';
      case 'cancelled': return 'danger';
      default: return 'default';
    }
}
