/**
 * Post-Campaign Learning Engine
 * Extracts lessons learned, success patterns, and actionable recommendations
 * from completed campaigns to power continuous improvement
 */

import { getBriefProcessingModel } from './client';
import { z } from 'zod';

export const CampaignLearningsSchema = z.object({
  executive_summary: z.string().describe('High-level summary of campaign performance and learnings'),
  performance_grade: z.enum(['A+', 'A', 'B+', 'B', 'C+', 'C', 'D', 'F']).describe('Overall campaign grade'),
  kpi_analysis: z.array(
    z.object({
      kpi: z.string(),
      target: z.string(),
      actual: z.string(),
      achieved: z.boolean(),
      variance: z.string(),
      insight: z.string().describe('Why this KPI was hit or missed'),
    })
  ).describe('KPI target vs actual analysis'),
  success_factors: z.array(
    z.object({
      factor: z.string(),
      impact: z.enum(['high', 'medium', 'low']),
      description: z.string(),
      replicable: z.boolean().describe('Can this be replicated in future campaigns?'),
      how_to_replicate: z.string().optional(),
    })
  ).describe('What worked well and why'),
  failures_and_challenges: z.array(
    z.object({
      issue: z.string(),
      impact: z.enum(['high', 'medium', 'low']),
      root_cause: z.string(),
      was_preventable: z.boolean(),
      prevention_strategy: z.string(),
    })
  ).describe('What went wrong and how to prevent it'),
  creator_performance: z.array(
    z.object({
      creator_name: z.string(),
      overall_rating: z.number().min(1).max(5),
      strengths: z.array(z.string()),
      weaknesses: z.array(z.string()),
      would_rehire: z.boolean(),
      best_content_type: z.string(),
      notes: z.string(),
    })
  ).describe('Per-creator performance review'),
  content_insights: z.object({
    best_performing_type: z.string(),
    worst_performing_type: z.string(),
    optimal_posting_times: z.array(z.string()),
    content_themes_that_resonated: z.array(z.string()),
    content_themes_that_flopped: z.array(z.string()),
    audience_preferences: z.array(z.string()),
  }).describe('Content performance insights'),
  financial_analysis: z.object({
    budget_utilization: z.string(),
    cost_efficiency: z.string(),
    best_roi_creator: z.string(),
    worst_roi_creator: z.string(),
    cost_per_engagement: z.string(),
    cost_per_impression: z.string(),
    recommendations: z.array(z.string()),
  }).describe('Financial performance analysis'),
  audience_insights: z.object({
    top_demographics: z.array(z.string()),
    unexpected_audiences: z.array(z.string()),
    engagement_patterns: z.array(z.string()),
    sentiment_overview: z.string(),
  }).describe('Audience insights discovered'),
  recommendations: z.array(
    z.object({
      category: z.enum(['strategy', 'creators', 'content', 'budget', 'process', 'tools']),
      recommendation: z.string(),
      priority: z.enum(['critical', 'high', 'medium', 'low']),
      expected_impact: z.string(),
      effort_level: z.enum(['low', 'medium', 'high']),
    })
  ).describe('Actionable recommendations for future campaigns'),
  industry_benchmarks: z.object({
    vs_industry_avg_engagement: z.string(),
    vs_industry_avg_reach: z.string(),
    vs_industry_avg_roi: z.string(),
    percentile: z.string().describe('Where this campaign lands vs industry'),
  }).describe('Industry benchmark comparison'),
  repeat_campaign_blueprint: z.object({
    recommended_budget: z.string(),
    recommended_duration: z.string(),
    recommended_creators: z.number(),
    key_changes: z.array(z.string()),
    expected_improvement: z.string(),
  }).describe('Blueprint for running this campaign again'),
});

export type CampaignLearnings = z.infer<typeof CampaignLearningsSchema>;

export interface LearningInput {
  campaign: {
    name: string;
    industry?: string;
    startDate?: string;
    endDate?: string;
    budgetTotal?: number;
    actualSpent?: number;
    status: string;
    objectives?: string[];
    kpis?: string[];
  };
  creators: Array<{
    name: string;
    platform: string;
    followers: number;
    tasksCompleted: number;
    totalTasks: number;
    totalViews?: number;
    totalLikes?: number;
    totalComments?: number;
    engagementRate?: number;
    paymentAmount?: number;
    onTimeDelivery?: boolean;
  }>;
  contentTasks: Array<{
    title: string;
    deliverableType: string;
    status: string;
    creatorName: string;
    views?: number;
    likes?: number;
    comments?: number;
    shares?: number;
    engagementRate?: number;
  }>;
  totalReach?: number;
  totalImpressions?: number;
  totalEngagements?: number;
}

/**
 * Extract learnings and recommendations from a completed campaign
 */
export async function extractLearnings(input: LearningInput): Promise<CampaignLearnings> {
  const model = getBriefProcessingModel();

  const budgetUtilization = input.campaign.budgetTotal && input.campaign.budgetTotal > 0
    ? `${((input.campaign.actualSpent || 0) / input.campaign.budgetTotal * 100).toFixed(1)}%`
    : 'unknown';

  const totalCreatorSpend = input.creators.reduce((sum, c) => sum + (c.paymentAmount || 0), 0);

  const prompt = `You are a senior campaign strategist performing a post-campaign analysis. Extract comprehensive learnings from this completed campaign.

CAMPAIGN OVERVIEW:
- Name: ${input.campaign.name}
- Industry: ${input.campaign.industry || 'General'}
- Duration: ${input.campaign.startDate || '?'} to ${input.campaign.endDate || '?'}
- Budget: $${input.campaign.budgetTotal?.toLocaleString() || '0'} (spent: $${input.campaign.actualSpent?.toLocaleString() || '0'}, utilization: ${budgetUtilization})
- Status: ${input.campaign.status}
- Objectives: ${input.campaign.objectives?.join('; ') || 'Not specified'}
- KPIs: ${input.campaign.kpis?.join('; ') || 'Not specified'}

AGGREGATE METRICS:
- Total Reach: ${input.totalReach?.toLocaleString() || 'Not tracked'}
- Total Impressions: ${input.totalImpressions?.toLocaleString() || 'Not tracked'}
- Total Engagements: ${input.totalEngagements?.toLocaleString() || 'Not tracked'}
- Creator Spend: $${totalCreatorSpend.toLocaleString()}

CREATORS (${input.creators.length}):
${input.creators.map(c => `
- ${c.name} (${c.platform}, ${c.followers.toLocaleString()} followers)
  Tasks: ${c.tasksCompleted}/${c.totalTasks} completed
  Views: ${c.totalViews?.toLocaleString() || 'N/A'} | Likes: ${c.totalLikes?.toLocaleString() || 'N/A'}
  Comments: ${c.totalComments?.toLocaleString() || 'N/A'} | Engagement: ${c.engagementRate || 'N/A'}%
  Payment: $${c.paymentAmount?.toLocaleString() || '0'} | On-time: ${c.onTimeDelivery ?? 'unknown'}
`).join('')}

CONTENT TASKS (${input.contentTasks.length}):
${input.contentTasks.map(t => `- ${t.title} | ${t.deliverableType} | ${t.status} | Creator: ${t.creatorName} | Views: ${t.views?.toLocaleString() || 'N/A'} | Engagement: ${t.engagementRate || 'N/A'}%`).join('\n')}

Generate a comprehensive post-campaign analysis with actionable learnings.

Return JSON with all the fields of a complete CampaignLearnings object including:
executive_summary, performance_grade, kpi_analysis, success_factors, failures_and_challenges,
creator_performance, content_insights, financial_analysis, audience_insights, recommendations,
industry_benchmarks, repeat_campaign_blueprint.

Important:
- Grade the campaign fairly based on actual results
- Be specific — reference actual numbers and creators
- Recommendations should be actionable, not generic
- Compare to industry benchmarks for the specific industry
- The repeat_campaign_blueprint should be a clear plan for improvement
- Return valid JSON only, no markdown formatting

JSON:`;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    let jsonText = response.text().trim();

    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/```json\n?/, '').replace(/```\n?$/, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```\n?/, '').replace(/```\n?$/, '');
    }

    const parsed = JSON.parse(jsonText);
    return CampaignLearningsSchema.parse(parsed);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to extract learnings: ${error.message}`);
    }
    throw new Error('Failed to extract learnings: Unknown error');
  }
}
