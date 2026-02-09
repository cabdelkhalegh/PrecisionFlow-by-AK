'use client';

import { trpc } from '@/lib/trpc';
import Link from 'next/link';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export default function BriefsPage() {
  // Get all campaigns, then we can navigate to their briefs
  const { data: campaignsData, isLoading } = trpc.campaigns.list.useQuery({
    limit: 100,
    offset: 0,
  });

  return (
    <AppLayout>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Briefs</h1>
          <p className="mt-2 text-sm text-gray-600">
            Campaign briefs for AI-powered processing and approval
          </p>
        </div>

        {isLoading ? (
          <div className="py-12 text-center text-gray-500">Loading briefs...</div>
        ) : campaignsData?.campaigns.length === 0 ? (
          <Card>
            <div className="py-12 text-center">
              <div className="text-4xl mb-4">📄</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No campaigns yet</h3>
              <p className="text-gray-600 mb-4">
                Create a campaign first, then upload briefs for AI processing.
              </p>
              <Link
                href="/campaigns/new"
                className="inline-block rounded-lg bg-blue-600 px-6 py-2 text-white font-medium hover:bg-blue-700 transition-colors"
              >
                Create Campaign
              </Link>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            {campaignsData?.campaigns.map((campaign) => (
              <CampaignBriefRow key={campaign.id} campaign={campaign} />
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}

interface CampaignWithClient {
  id: string;
  name: string;
  status: string;
  [key: string]: unknown;
}

function CampaignBriefRow({ campaign }: { campaign: CampaignWithClient }) {
  const { data } = trpc.briefs.getLatestByCampaign.useQuery({
    campaignId: campaign.id,
  });

  const brief = data;
  const hasBrief = !!brief;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <Link
              href={`/campaigns/${campaign.id}`}
              className="text-lg font-semibold text-gray-900 hover:text-blue-600 truncate"
            >
              {campaign.name}
            </Link>
            <Badge
              size="sm"
              variant={
                campaign.status === 'brief_approved'
                  ? 'success'
                  : campaign.status === 'brief_structured'
                    ? 'info'
                    : campaign.status === 'brief_uploaded'
                      ? 'warning'
                      : 'default'
              }
            >
              {campaign.status}
            </Badge>
          </div>
          {hasBrief ? (
            <div className="mt-2 space-y-1">
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span>Version {brief.version}</span>
                <span>•</span>
                <span>{brief.is_approved ? '✅ Approved' : '⏳ Pending Approval'}</span>
                <span>•</span>
                <span>
                  Updated {new Date(brief.updated_at).toLocaleDateString()}
                </span>
              </div>
              {brief.raw_content && (
                <p className="text-sm text-gray-500 line-clamp-2">
                  {brief.raw_content.substring(0, 200)}
                  {brief.raw_content.length > 200 ? '...' : ''}
                </p>
              )}
              {brief.structured_data && (
                <div className="mt-1 flex gap-2">
                  <Badge size="sm" variant="success">
                    AI Processed
                  </Badge>
                </div>
              )}
            </div>
          ) : (
            <p className="mt-1 text-sm text-gray-400">No brief uploaded yet</p>
          )}
        </div>
        <div className="ml-4 shrink-0">
          <Link
            href={`/campaigns/${campaign.id}`}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            View Campaign →
          </Link>
        </div>
      </div>
    </Card>
  );
}
