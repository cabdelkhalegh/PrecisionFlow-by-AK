'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { trpc } from '@/lib/trpc';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

type StrategyData = {
  executive_summary?: string;
  content_pillars?: Array<{
    name: string;
    description: string;
    percentage: number;
    content_types: string[];
    example_topics: string[];
  }>;
  posting_schedule?: {
    frequency: string;
    best_days: string[];
    best_times: string[];
    platform_cadence: Array<{ platform: string; posts_per_week: number; content_types: string[] }>;
  };
  audience_strategy?: {
    primary_audience: { demographics: string; psychographics: string; platforms: string[]; interests: string[] };
    secondary_audience?: { demographics: string; psychographics: string; platforms: string[]; interests: string[] };
    messaging_angles: string[];
  };
  budget_allocation?: Array<{ category: string; percentage: number; rationale: string }>;
  creator_profile?: {
    ideal_follower_range: string;
    min_engagement_rate: number;
    preferred_platforms: string[];
    preferred_niches: string[];
    content_style: string[];
    creator_count: number;
  };
  kpi_targets?: Array<{ metric: string; target: string; measurement_method: string }>;
  risk_mitigation?: Array<{ risk: string; likelihood: string; impact: string; mitigation: string }>;
  timeline_phases?: Array<{ phase: string; duration: string; activities: string[]; milestones: string[] }>;
  competitive_positioning?: string;
  success_criteria?: string[];
};

type RiskData = {
  overall_risk_score?: number;
  risk_level?: string;
  health_status?: string;
  executive_summary?: string;
  risk_factors?: Array<{
    category: string;
    title: string;
    description: string;
    severity: string;
    mitigation: string;
    action_required: boolean;
  }>;
  budget_analysis?: { burn_rate: string; projected_overspend: boolean; recommendation: string };
  timeline_analysis?: { days_remaining: number; on_track: boolean; projected_completion: string };
  action_items?: Array<{ priority: string; action: string; assigned_to: string; impact: string }>;
  trend?: string;
};

export default function CampaignAIPage() {
  const params = useParams();
  const campaignId = params.id as string;

  const [activeTab, setActiveTab] = useState<'strategy' | 'risk' | 'performance' | 'learnings'>('strategy');

  const { data: campaign } = trpc.campaigns.getById.useQuery({ id: campaignId });
  const { data: strategyData } = trpc.ai.getStrategy.useQuery({ campaignId });

  const strategyMutation = trpc.ai.generateStrategy.useMutation();
  const riskMutation = trpc.ai.analyzeRisk.useMutation();
  const campaignPredictionMutation = trpc.ai.predictCampaignPerformance.useMutation();
  const learningsMutation = trpc.ai.extractLearnings.useMutation();

  const strategy = (strategyMutation.data?.strategy || strategyData?.strategy) as StrategyData | null;
  const riskAnalysis = riskMutation.data as RiskData | null;
  const campaignPrediction = campaignPredictionMutation.data;
  const learnings = learningsMutation.data;

  const tabs = [
    { key: 'strategy' as const, label: '🧠 Strategy', ready: !!strategy },
    { key: 'risk' as const, label: '🛡️ Risk', ready: !!riskAnalysis },
    { key: 'performance' as const, label: '📈 Performance', ready: !!campaignPrediction },
    { key: 'learnings' as const, label: '📚 Learnings', ready: !!learnings },
  ];

  return (
    <AppLayout>
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <Link
            href={`/campaigns/${campaignId}`}
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
          >
            &larr; Back to Campaign
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">
            🤖 AI Intelligence: {campaign?.name || 'Loading...'}
          </h1>
          <p className="mt-1 text-gray-500">
            Generate strategy, analyze risk, predict performance, and extract learnings
          </p>
        </div>

        {/* Action Buttons */}
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Button
            onClick={() => {
              setActiveTab('strategy');
              strategyMutation.mutate({ campaignId });
            }}
            disabled={strategyMutation.isPending}
          >
            {strategyMutation.isPending ? 'Generating...' : '🧠 Generate Strategy'}
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              setActiveTab('risk');
              riskMutation.mutate({ campaignId });
            }}
            disabled={riskMutation.isPending}
          >
            {riskMutation.isPending ? 'Analyzing...' : '🛡️ Analyze Risk'}
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              setActiveTab('performance');
              campaignPredictionMutation.mutate({ campaignId });
            }}
            disabled={campaignPredictionMutation.isPending}
          >
            {campaignPredictionMutation.isPending ? 'Predicting...' : '📈 Predict Performance'}
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              setActiveTab('learnings');
              learningsMutation.mutate({ campaignId });
            }}
            disabled={learningsMutation.isPending}
          >
            {learningsMutation.isPending ? 'Extracting...' : '📚 Extract Learnings'}
          </Button>
        </div>

        {/* Error Display */}
        {strategyMutation.error && (
          <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700">
            Strategy Error: {strategyMutation.error.message}
          </div>
        )}
        {riskMutation.error && (
          <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700">
            Risk Error: {riskMutation.error.message}
          </div>
        )}
        {campaignPredictionMutation.error && (
          <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700">
            Prediction Error: {campaignPredictionMutation.error.message}
          </div>
        )}
        {learningsMutation.error && (
          <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700">
            Learnings Error: {learningsMutation.error.message}
          </div>
        )}

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <div className="flex space-x-6">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`pb-3 text-sm font-medium border-b-2 ${
                  activeTab === tab.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
                {tab.ready && (
                  <span className="ml-1 inline-block h-2 w-2 rounded-full bg-green-400" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'strategy' && (
          <div className="space-y-6">
            {strategyMutation.isPending && <LoadingCard title="Generating Campaign Strategy" />}
            {strategy ? (
              <>
                <Card>
                  <h2 className="text-lg font-semibold text-gray-900 mb-2">Executive Summary</h2>
                  <p className="text-sm text-gray-700">{strategy.executive_summary}</p>
                </Card>

                {strategy.content_pillars && strategy.content_pillars.length > 0 && (
                  <Card>
                    <h2 className="text-lg font-semibold text-gray-900 mb-3">Content Pillars</h2>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {strategy.content_pillars.map((pillar, i) => (
                        <div key={i} className="rounded-lg border border-gray-200 p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-medium text-gray-900">{pillar.name}</h3>
                            <Badge size="sm" variant="info">{pillar.percentage}%</Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{pillar.description}</p>
                          <div className="flex flex-wrap gap-1">
                            {pillar.content_types.map((ct, j) => (
                              <Badge key={j} size="sm" variant="default">{ct}</Badge>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

                {strategy.posting_schedule && (
                  <Card>
                    <h2 className="text-lg font-semibold text-gray-900 mb-3">Posting Schedule</h2>
                    <div className="grid gap-4 sm:grid-cols-3 mb-4">
                      <div className="rounded-lg bg-blue-50 p-3">
                        <div className="text-xs text-gray-500">Frequency</div>
                        <div className="font-medium text-gray-900">{strategy.posting_schedule.frequency}</div>
                      </div>
                      <div className="rounded-lg bg-green-50 p-3">
                        <div className="text-xs text-gray-500">Best Days</div>
                        <div className="font-medium text-gray-900">{strategy.posting_schedule.best_days.join(', ')}</div>
                      </div>
                      <div className="rounded-lg bg-purple-50 p-3">
                        <div className="text-xs text-gray-500">Best Times</div>
                        <div className="font-medium text-gray-900">{strategy.posting_schedule.best_times.join(', ')}</div>
                      </div>
                    </div>
                    {strategy.posting_schedule.platform_cadence.map((pc, i) => (
                      <div key={i} className="flex items-center justify-between rounded-lg bg-gray-50 p-3 mb-2">
                        <span className="font-medium">{pc.platform}</span>
                        <span className="text-sm text-gray-600">{pc.posts_per_week} posts/week</span>
                        <div className="flex gap-1">
                          {pc.content_types.map((ct, j) => (
                            <Badge key={j} size="sm" variant="default">{ct}</Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </Card>
                )}

                {strategy.budget_allocation && strategy.budget_allocation.length > 0 && (
                  <Card>
                    <h2 className="text-lg font-semibold text-gray-900 mb-3">Budget Allocation</h2>
                    <div className="space-y-2">
                      {strategy.budget_allocation.map((item, i) => (
                        <div key={i} className="flex items-center gap-4">
                          <div className="w-32 text-sm font-medium text-gray-900">{item.category}</div>
                          <div className="flex-1">
                            <div className="h-4 rounded-full bg-gray-100 overflow-hidden">
                              <div
                                className="h-full rounded-full bg-blue-500"
                                style={{ width: `${item.percentage}%` }}
                              />
                            </div>
                          </div>
                          <div className="w-12 text-sm font-medium text-right">{item.percentage}%</div>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

                {strategy.creator_profile && (
                  <Card>
                    <h2 className="text-lg font-semibold text-gray-900 mb-3">Ideal Creator Profile</h2>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <div className="text-xs text-gray-500">Follower Range</div>
                        <div className="font-medium">{strategy.creator_profile.ideal_follower_range}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Min Engagement</div>
                        <div className="font-medium">{strategy.creator_profile.min_engagement_rate}%</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Recommended Creators</div>
                        <div className="font-medium">{strategy.creator_profile.creator_count}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Content Style</div>
                        <div className="flex flex-wrap gap-1">
                          {strategy.creator_profile.content_style.map((s, i) => (
                            <Badge key={i} size="sm" variant="default">{s}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Card>
                )}

                {strategy.kpi_targets && strategy.kpi_targets.length > 0 && (
                  <Card>
                    <h2 className="text-lg font-semibold text-gray-900 mb-3">KPI Targets</h2>
                    <div className="space-y-2">
                      {strategy.kpi_targets.map((kpi, i) => (
                        <div key={i} className="flex items-start justify-between rounded-lg bg-gray-50 p-3">
                          <div>
                            <div className="font-medium text-gray-900">{kpi.metric}</div>
                            <div className="text-xs text-gray-500">{kpi.measurement_method}</div>
                          </div>
                          <Badge variant="info">{kpi.target}</Badge>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

                {strategy.timeline_phases && strategy.timeline_phases.length > 0 && (
                  <Card>
                    <h2 className="text-lg font-semibold text-gray-900 mb-3">Timeline Phases</h2>
                    <div className="space-y-4">
                      {strategy.timeline_phases.map((phase, i) => (
                        <div key={i} className="border-l-4 border-blue-400 pl-4">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium text-gray-900">{phase.phase}</h3>
                            <Badge size="sm" variant="default">{phase.duration}</Badge>
                          </div>
                          <ul className="mt-1 space-y-1">
                            {phase.activities.map((a, j) => (
                              <li key={j} className="text-sm text-gray-600">• {a}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

                {strategy.risk_mitigation && strategy.risk_mitigation.length > 0 && (
                  <Card>
                    <h2 className="text-lg font-semibold text-gray-900 mb-3">Risk Mitigation</h2>
                    <div className="space-y-3">
                      {strategy.risk_mitigation.map((risk, i) => (
                        <div key={i} className="rounded-lg border border-gray-200 p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-gray-900">{risk.risk}</span>
                            <Badge size="sm" variant={risk.likelihood === 'high' ? 'danger' : risk.likelihood === 'medium' ? 'warning' : 'success'}>
                              {risk.likelihood}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">{risk.mitigation}</p>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

                {strategy.success_criteria && (
                  <Card>
                    <h2 className="text-lg font-semibold text-gray-900 mb-3">Success Criteria</h2>
                    <ul className="space-y-1">
                      {strategy.success_criteria.map((c, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                          <span className="text-green-500 mt-0.5">&#10003;</span> {c}
                        </li>
                      ))}
                    </ul>
                  </Card>
                )}
              </>
            ) : !strategyMutation.isPending && (
              <EmptyCard
                icon="🧠"
                title="Campaign Strategy"
                description="Generate a full AI strategy from your campaign brief"
                action="Generate Strategy"
                onAction={() => strategyMutation.mutate({ campaignId })}
              />
            )}
          </div>
        )}

        {activeTab === 'risk' && (
          <div className="space-y-6">
            {riskMutation.isPending && <LoadingCard title="Analyzing Campaign Risk" />}
            {riskAnalysis ? (
              <>
                <Card>
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-lg font-semibold text-gray-900">Risk Overview</h2>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          riskAnalysis.risk_level === 'low' ? 'success'
                            : riskAnalysis.risk_level === 'medium' ? 'warning'
                            : 'danger'
                        }
                      >
                        {riskAnalysis.risk_level} risk
                      </Badge>
                      <Badge variant={
                        riskAnalysis.health_status === 'healthy' ? 'success'
                          : riskAnalysis.health_status === 'at_risk' ? 'warning'
                          : 'danger'
                      }>
                        {riskAnalysis.health_status}
                      </Badge>
                      {riskAnalysis.trend && (
                        <span className={`text-sm font-medium ${
                          riskAnalysis.trend === 'improving' ? 'text-green-600'
                            : riskAnalysis.trend === 'stable' ? 'text-gray-600'
                            : 'text-red-600'
                        }`}>
                          {riskAnalysis.trend === 'improving' ? '↑' : riskAnalysis.trend === 'declining' ? '↓' : '→'} {riskAnalysis.trend}
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-gray-700">{riskAnalysis.executive_summary}</p>
                  {riskAnalysis.overall_risk_score !== undefined && (
                    <div className="mt-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">Risk Score:</span>
                        <div className="flex-1 h-3 rounded-full bg-gray-100 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              riskAnalysis.overall_risk_score < 30 ? 'bg-green-500'
                                : riskAnalysis.overall_risk_score < 60 ? 'bg-yellow-500'
                                : 'bg-red-500'
                            }`}
                            style={{ width: `${riskAnalysis.overall_risk_score}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">{riskAnalysis.overall_risk_score}/100</span>
                      </div>
                    </div>
                  )}
                </Card>

                {riskAnalysis.action_items && riskAnalysis.action_items.length > 0 && (
                  <Card>
                    <h2 className="text-lg font-semibold text-gray-900 mb-3">Action Items</h2>
                    <div className="space-y-2">
                      {riskAnalysis.action_items.map((item, i) => (
                        <div key={i} className="flex items-start gap-3 rounded-lg border border-gray-200 p-3">
                          <Badge
                            size="sm"
                            variant={
                              item.priority === 'immediate' ? 'danger'
                                : item.priority === 'this_week' ? 'warning'
                                : 'default'
                            }
                          >
                            {item.priority}
                          </Badge>
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-900">{item.action}</div>
                            <div className="text-xs text-gray-500">
                              Assigned: {item.assigned_to} | Impact: {item.impact}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

                {riskAnalysis.risk_factors && riskAnalysis.risk_factors.length > 0 && (
                  <Card>
                    <h2 className="text-lg font-semibold text-gray-900 mb-3">Risk Factors</h2>
                    <div className="space-y-3">
                      {riskAnalysis.risk_factors.map((rf, i) => (
                        <div key={i} className="rounded-lg border border-gray-200 p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge size="sm" variant={rf.severity === 'critical' || rf.severity === 'high' ? 'danger' : rf.severity === 'medium' ? 'warning' : 'success'}>
                              {rf.severity}
                            </Badge>
                            <span className="font-medium text-gray-900">{rf.title}</span>
                            <Badge size="sm" variant="default">{rf.category}</Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-1">{rf.description}</p>
                          <p className="text-sm text-blue-700">Mitigation: {rf.mitigation}</p>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

                {riskAnalysis.budget_analysis && (
                  <Card>
                    <h2 className="text-lg font-semibold text-gray-900 mb-3">Budget Analysis</h2>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="rounded-lg bg-gray-50 p-3">
                        <div className="text-xs text-gray-500">Burn Rate</div>
                        <div className="font-medium">{riskAnalysis.budget_analysis.burn_rate}</div>
                      </div>
                      <div className={`rounded-lg p-3 ${riskAnalysis.budget_analysis.projected_overspend ? 'bg-red-50' : 'bg-green-50'}`}>
                        <div className="text-xs text-gray-500">Overspend Projected</div>
                        <div className="font-medium">{riskAnalysis.budget_analysis.projected_overspend ? 'Yes' : 'No'}</div>
                      </div>
                    </div>
                    <p className="mt-3 text-sm text-gray-700">{riskAnalysis.budget_analysis.recommendation}</p>
                  </Card>
                )}
              </>
            ) : !riskMutation.isPending && (
              <EmptyCard
                icon="🛡️"
                title="Risk Intelligence"
                description="Analyze budget, timeline, approval, and delivery risks"
                action="Analyze Risk"
                onAction={() => riskMutation.mutate({ campaignId })}
              />
            )}
          </div>
        )}

        {activeTab === 'performance' && (
          <div className="space-y-6">
            {campaignPredictionMutation.isPending && <LoadingCard title="Predicting Campaign Performance" />}
            {campaignPrediction ? (
              <>
                <Card>
                  <h2 className="text-lg font-semibold text-gray-900 mb-3">Performance Prediction</h2>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="rounded-lg bg-blue-50 p-4 text-center">
                      <div className="text-xs text-gray-500">Expected Reach</div>
                      <div className="text-2xl font-bold text-blue-600">
                        {campaignPrediction.total_predicted_reach.expected.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-400">
                        {campaignPrediction.total_predicted_reach.low.toLocaleString()} &mdash; {campaignPrediction.total_predicted_reach.high.toLocaleString()}
                      </div>
                    </div>
                    <div className="rounded-lg bg-green-50 p-4 text-center">
                      <div className="text-xs text-gray-500">Expected Engagement</div>
                      <div className="text-2xl font-bold text-green-600">
                        {campaignPrediction.total_predicted_engagement.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-400">
                        Rate: {campaignPrediction.overall_engagement_rate}%
                      </div>
                    </div>
                    <div className="rounded-lg bg-purple-50 p-4 text-center">
                      <div className="text-xs text-gray-500">Predicted ROI</div>
                      <div className="text-2xl font-bold text-purple-600">
                        {campaignPrediction.campaign_roi.roi_percentage}
                      </div>
                      <div className="text-xs text-gray-400">
                        Media Value: {campaignPrediction.campaign_roi.predicted_media_value}
                      </div>
                    </div>
                  </div>
                </Card>

                {campaignPrediction.per_creator_breakdown?.length > 0 && (
                  <Card>
                    <h2 className="text-lg font-semibold text-gray-900 mb-3">Per-Creator Breakdown</h2>
                    <div className="space-y-2">
                      {campaignPrediction.per_creator_breakdown.map((c, i) => (
                        <div key={i} className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
                          <div className="font-medium text-gray-900">{c.creator_name}</div>
                          <div className="flex items-center gap-4 text-sm">
                            <span>Reach: {c.predicted_reach.toLocaleString()}</span>
                            <span>Engagement: {c.predicted_engagement.toLocaleString()}</span>
                            <span>ROI: {c.predicted_roi}</span>
                            <Badge size="sm" variant={c.risk_level === 'low' ? 'success' : c.risk_level === 'medium' ? 'warning' : 'danger'}>
                              {c.risk_level}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

                {campaignPrediction.recommendations?.length > 0 && (
                  <Card>
                    <h2 className="text-lg font-semibold text-gray-900 mb-3">Recommendations</h2>
                    <ul className="space-y-1">
                      {campaignPrediction.recommendations.map((r, i) => (
                        <li key={i} className="text-sm text-gray-700">&#10003; {r}</li>
                      ))}
                    </ul>
                  </Card>
                )}
              </>
            ) : !campaignPredictionMutation.isPending && (
              <EmptyCard
                icon="📈"
                title="Performance Prediction"
                description="Predict reach, engagement, and ROI for your campaign"
                action="Predict Performance"
                onAction={() => campaignPredictionMutation.mutate({ campaignId })}
              />
            )}
          </div>
        )}

        {activeTab === 'learnings' && (
          <div className="space-y-6">
            {learningsMutation.isPending && <LoadingCard title="Extracting Campaign Learnings" />}
            {learnings ? (
              <>
                <Card>
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-lg font-semibold text-gray-900">Campaign Grade</h2>
                    <span className="text-3xl font-bold text-blue-600">{learnings.performance_grade}</span>
                  </div>
                  <p className="text-sm text-gray-700">{learnings.executive_summary}</p>
                </Card>

                {learnings.kpi_analysis?.length > 0 && (
                  <Card>
                    <h2 className="text-lg font-semibold text-gray-900 mb-3">KPI Analysis</h2>
                    <div className="space-y-2">
                      {learnings.kpi_analysis.map((kpi, i) => (
                        <div key={i} className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
                          <div>
                            <div className="font-medium text-gray-900">{kpi.kpi}</div>
                            <div className="text-xs text-gray-500">Target: {kpi.target} | Actual: {kpi.actual}</div>
                          </div>
                          <Badge variant={kpi.achieved ? 'success' : 'danger'}>
                            {kpi.achieved ? 'Achieved' : 'Missed'}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

                {learnings.recommendations?.length > 0 && (
                  <Card>
                    <h2 className="text-lg font-semibold text-gray-900 mb-3">Recommendations</h2>
                    <div className="space-y-2">
                      {learnings.recommendations.map((rec, i) => (
                        <div key={i} className="flex items-start gap-3 rounded-lg border border-gray-200 p-3">
                          <Badge size="sm" variant={rec.priority === 'critical' ? 'danger' : rec.priority === 'high' ? 'warning' : 'default'}>
                            {rec.priority}
                          </Badge>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{rec.recommendation}</div>
                            <div className="text-xs text-gray-500">{rec.category} | Impact: {rec.expected_impact}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

                {learnings.repeat_campaign_blueprint && (
                  <Card>
                    <h2 className="text-lg font-semibold text-gray-900 mb-3">Repeat Campaign Blueprint</h2>
                    <div className="grid gap-4 sm:grid-cols-3 mb-3">
                      <div className="rounded-lg bg-blue-50 p-3">
                        <div className="text-xs text-gray-500">Recommended Budget</div>
                        <div className="font-medium">{learnings.repeat_campaign_blueprint.recommended_budget}</div>
                      </div>
                      <div className="rounded-lg bg-green-50 p-3">
                        <div className="text-xs text-gray-500">Recommended Duration</div>
                        <div className="font-medium">{learnings.repeat_campaign_blueprint.recommended_duration}</div>
                      </div>
                      <div className="rounded-lg bg-purple-50 p-3">
                        <div className="text-xs text-gray-500">Recommended Creators</div>
                        <div className="font-medium">{learnings.repeat_campaign_blueprint.recommended_creators}</div>
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-700 mb-1">Key Changes:</div>
                      <ul className="space-y-1">
                        {learnings.repeat_campaign_blueprint.key_changes.map((c, i) => (
                          <li key={i} className="text-sm text-gray-600">&#10003; {c}</li>
                        ))}
                      </ul>
                    </div>
                  </Card>
                )}
              </>
            ) : !learningsMutation.isPending && (
              <EmptyCard
                icon="📚"
                title="Campaign Learnings"
                description="Extract lessons learned and success patterns from this campaign"
                action="Extract Learnings"
                onAction={() => learningsMutation.mutate({ campaignId })}
              />
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}

function LoadingCard({ title }: { title: string }) {
  return (
    <Card>
      <div className="flex flex-col items-center justify-center py-12">
        <div className="text-4xl mb-4 animate-pulse">🤖</div>
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-500 mt-2">AI is analyzing your campaign data...</p>
      </div>
    </Card>
  );
}

function EmptyCard({ icon, title, description, action, onAction }: {
  icon: string;
  title: string;
  description: string;
  action: string;
  onAction: () => void;
}) {
  return (
    <Card>
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="text-4xl mb-4">{icon}</div>
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-500 mt-2 max-w-sm">{description}</p>
        <Button onClick={onAction} className="mt-4">
          {action}
        </Button>
      </div>
    </Card>
  );
}
