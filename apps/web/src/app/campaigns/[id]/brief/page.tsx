'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { trpc } from '@/lib/trpc';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

type StructuredData = {
  objectives?: string[];
  target_audience?: string;
  deliverables?: Array<{ type: string; quantity: number; description: string; deadline?: string }>;
  timeline?: string;
  budget?: string;
  kpis?: string[];
  missing_info?: string[];
};

export default function CampaignBriefPage() {
  const params = useParams();
  const campaignId = params.id as string;

  const [rawContent, setRawContent] = useState('');
  const [uploadedBriefId, setUploadedBriefId] = useState<string | null>(null);
  const [aiResult, setAiResult] = useState<StructuredData | null>(null);

  const { data: campaign } = trpc.campaigns.getById.useQuery({ id: campaignId });
  const { data: latestBrief } = trpc.briefs.getLatestByCampaign.useQuery({ campaignId });

  const uploadMutation = trpc.briefs.upload.useMutation({
    onSuccess: (data) => {
      setUploadedBriefId(data.id);
    },
  });

  const processMutation = trpc.briefs.processWithAI.useMutation({
    onSuccess: (data) => {
      const sd = data.structured_data as StructuredData | null;
      setAiResult(sd ?? null);
    },
  });

  const handleUpload = () => {
    if (!rawContent.trim()) return;
    uploadMutation.mutate({ campaignId, rawContent: rawContent.trim() });
  };

  const handleProcessAI = () => {
    const briefId = uploadedBriefId || latestBrief?.id;
    if (!briefId) return;
    processMutation.mutate({ id: briefId });
  };

  // Show AI results from existing brief or from new processing
  const displayData = aiResult || (latestBrief?.structured_data as StructuredData | null);

  // Derive risk level from missing info count (no state needed)
  const derivedRisk = (() => {
    if (displayData?.missing_info) {
      const count = displayData.missing_info.length;
      return count === 0 ? 'low' : count <= 2 ? 'medium' : count <= 4 ? 'high' : 'critical';
    }
    return null;
  })();
  const displayRisk = derivedRisk || campaign?.risk_level;

  return (
    <AppLayout>
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <Link
            href={`/campaigns/${campaignId}`}
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
          >
            ← Back to Campaign
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">
            📄 Brief: {campaign?.name || 'Loading…'}
          </h1>
          <p className="mt-1 text-gray-500">
            Upload campaign brief content and use AI to parse structured data
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Left: Upload */}
          <div className="space-y-6">
            {/* Existing Brief Info */}
            {latestBrief && (
              <Card>
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Current Brief</h2>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Version</span>
                    <span className="font-medium">v{latestBrief.version}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Status</span>
                    <Badge variant={latestBrief.is_approved ? 'success' : 'warning'}>
                      {latestBrief.is_approved ? 'Approved' : 'Pending'}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">AI Parsed</span>
                    <Badge variant={latestBrief.structured_data ? 'success' : 'default'}>
                      {latestBrief.structured_data ? 'Yes' : 'No'}
                    </Badge>
                  </div>
                </div>

                {/* Re-process button if brief exists but no AI data */}
                {!latestBrief.structured_data && latestBrief.raw_content && (
                  <div className="mt-4">
                    <Button
                      onClick={handleProcessAI}
                      disabled={processMutation.isPending}
                      className="w-full"
                    >
                      {processMutation.isPending ? '🤖 Processing…' : '🤖 Parse with AI'}
                    </Button>
                  </div>
                )}
              </Card>
            )}

            {/* Upload New Brief */}
            <Card>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">
                {latestBrief ? 'Upload New Version' : 'Upload Brief'}
              </h2>
              <p className="text-sm text-gray-500 mb-4">
                Paste the campaign brief content below. The AI will extract objectives,
                deliverables, timeline, budget, and KPIs.
              </p>

              <textarea
                value={rawContent}
                onChange={(e) => setRawContent(e.target.value)}
                rows={12}
                className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder={`Example:

Campaign: Summer Beauty Launch 2025
Client: GlowCo Cosmetics
Budget: $50,000
Timeline: June 1 - August 31, 2025

Objectives:
- Increase brand awareness among Gen Z
- Drive 10,000 product trials
- Generate 500K social impressions

Target Audience:
Women 18-28, interested in skincare and beauty

Deliverables:
- 5 Instagram Reels (30-60 seconds each)
- 10 TikTok videos
- 2 YouTube reviews

KPIs: Engagement rate > 5%, 50K reach per post`}
              />

              <div className="mt-4 flex gap-3">
                <Button
                  onClick={handleUpload}
                  disabled={!rawContent.trim() || uploadMutation.isPending}
                >
                  {uploadMutation.isPending ? 'Uploading…' : '📤 Upload Brief'}
                </Button>

                {(uploadedBriefId || (latestBrief?.raw_content)) && (
                  <Button
                    onClick={handleProcessAI}
                    disabled={processMutation.isPending}
                    variant="secondary"
                  >
                    {processMutation.isPending ? '🤖 Processing…' : '🤖 Parse with AI'}
                  </Button>
                )}
              </div>

              {uploadMutation.isSuccess && (
                <div className="mt-3 rounded-md bg-green-50 p-3 text-sm text-green-700">
                  ✅ Brief uploaded successfully (v{uploadMutation.data?.version}).
                  Click &quot;Parse with AI&quot; to extract structured data.
                </div>
              )}

              {uploadMutation.error && (
                <div className="mt-3 rounded-md bg-red-50 p-3 text-sm text-red-700">
                  ❌ {uploadMutation.error.message}
                </div>
              )}

              {processMutation.error && (
                <div className="mt-3 rounded-md bg-red-50 p-3 text-sm text-red-700">
                  ❌ AI Processing Error: {processMutation.error.message}
                </div>
              )}
            </Card>
          </div>

          {/* Right: AI Results */}
          <div className="space-y-6">
            {processMutation.isPending && (
              <Card>
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="text-4xl mb-4 animate-pulse">🤖</div>
                  <h3 className="text-lg font-semibold text-gray-900">AI Processing…</h3>
                  <p className="text-sm text-gray-500 mt-2">
                    Gemini is analyzing the brief content
                  </p>
                </div>
              </Card>
            )}

            {displayData && (
              <>
                {/* Risk Assessment */}
                <Card>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">Risk Assessment</h2>
                    <Badge
                      variant={
                        displayRisk === 'low'
                          ? 'success'
                          : displayRisk === 'medium'
                            ? 'warning'
                            : displayRisk === 'critical'
                              ? 'danger'
                              : 'danger'
                      }
                    >
                      {displayRisk || 'unknown'} risk
                    </Badge>
                  </div>
                  {displayData.missing_info && displayData.missing_info.length > 0 ? (
                    <div>
                      <p className="text-sm text-gray-500 mb-2">Missing information:</p>
                      <ul className="list-disc list-inside space-y-1">
                        {displayData.missing_info.map((item, i) => (
                          <li key={i} className="text-sm text-orange-700">
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <p className="text-sm text-green-600">✅ All critical information provided</p>
                  )}
                </Card>

                {/* Objectives */}
                {displayData.objectives && displayData.objectives.length > 0 && (
                  <Card>
                    <h2 className="text-lg font-semibold text-gray-900 mb-3">🎯 Objectives</h2>
                    <ul className="space-y-2">
                      {displayData.objectives.map((obj, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                          <span className="text-green-500 mt-0.5">✓</span>
                          {obj}
                        </li>
                      ))}
                    </ul>
                  </Card>
                )}

                {/* Target Audience */}
                {displayData.target_audience && (
                  <Card>
                    <h2 className="text-lg font-semibold text-gray-900 mb-3">👥 Target Audience</h2>
                    <p className="text-sm text-gray-700">{displayData.target_audience}</p>
                  </Card>
                )}

                {/* Deliverables */}
                {displayData.deliverables && displayData.deliverables.length > 0 && (
                  <Card>
                    <h2 className="text-lg font-semibold text-gray-900 mb-3">📦 Deliverables</h2>
                    <div className="space-y-3">
                      {displayData.deliverables.map((d, i) => (
                        <div
                          key={i}
                          className="flex items-start justify-between rounded-lg bg-gray-50 p-3"
                        >
                          <div>
                            <div className="font-medium text-gray-900">{d.type}</div>
                            <div className="text-sm text-gray-500">{d.description}</div>
                          </div>
                          <div className="text-right">
                            <Badge size="sm">×{d.quantity}</Badge>
                            {d.deadline && (
                              <div className="text-xs text-gray-400 mt-1">{d.deadline}</div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

                {/* Timeline & Budget */}
                <Card>
                  <h2 className="text-lg font-semibold text-gray-900 mb-3">📅 Timeline & Budget</h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-lg bg-blue-50 p-4">
                      <div className="text-sm text-gray-500">Timeline</div>
                      <div className="font-medium text-gray-900 mt-1">
                        {displayData.timeline || 'Not specified'}
                      </div>
                    </div>
                    <div className="rounded-lg bg-green-50 p-4">
                      <div className="text-sm text-gray-500">Budget</div>
                      <div className="font-medium text-gray-900 mt-1">
                        {displayData.budget || 'Not specified'}
                      </div>
                    </div>
                  </div>
                </Card>

                {/* KPIs */}
                {displayData.kpis && displayData.kpis.length > 0 && (
                  <Card>
                    <h2 className="text-lg font-semibold text-gray-900 mb-3">📊 KPIs</h2>
                    <div className="flex flex-wrap gap-2">
                      {displayData.kpis.map((kpi, i) => (
                        <Badge key={i} variant="info" size="sm">
                          {kpi}
                        </Badge>
                      ))}
                    </div>
                  </Card>
                )}
              </>
            )}

            {!displayData && !processMutation.isPending && (
              <Card>
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="text-4xl mb-4">🤖</div>
                  <h3 className="text-lg font-semibold text-gray-900">AI Brief Analysis</h3>
                  <p className="text-sm text-gray-500 mt-2 max-w-xs">
                    Upload a brief and click &quot;Parse with AI&quot; to extract structured campaign data
                    using Google Gemini
                  </p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
