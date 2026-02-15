/**
 * Content Performance Predictor
 * Predicts reach, engagement, and ROI before content goes live
 * Based on creator stats, content type, historical patterns, and campaign context
 */

import { getBriefProcessingModel } from './client';
import { z } from 'zod';

export const PerformancePredictionSchema = z.object({
  predicted_reach: z.object({
    low: z.number().describe('Conservative estimate'),
    expected: z.number().describe('Most likely estimate'),
    high: z.number().describe('Optimistic estimate'),
  }).describe('Predicted reach range'),
  predicted_engagement: z.object({
    rate: z.number().describe('Expected engagement rate percentage'),
    likes: z.number().describe('Predicted likes'),
    comments: z.number().describe('Predicted comments'),
    shares: z.number().describe('Predicted shares'),
    saves: z.number().describe('Predicted saves/bookmarks'),
  }).describe('Predicted engagement metrics'),
  predicted_roi: z.object({
    cost_per_impression: z.string().describe('Estimated CPM'),
    cost_per_engagement: z.string().describe('Estimated CPE'),
    estimated_media_value: z.string().describe('Earned media value'),
    roi_percentage: z.string().describe('Expected ROI percentage'),
  }).describe('ROI predictions'),
  confidence_level: z.enum(['low', 'medium', 'high']).describe('Confidence in the prediction'),
  confidence_explanation: z.string().describe('Why this confidence level'),
  optimization_tips: z.array(z.string()).describe('Tips to improve predicted performance'),
  best_posting_time: z.string().describe('Recommended posting time for this content'),
  hashtag_recommendations: z.array(z.string()).describe('Recommended hashtags'),
  content_format_notes: z.string().describe('Notes on optimal content format'),
  comparison: z.object({
    vs_creator_average: z.string().describe('How this compares to creator average'),
    vs_industry_average: z.string().describe('How this compares to industry average'),
    vs_platform_average: z.string().describe('How this compares to platform average'),
  }).describe('Comparative analysis'),
});

export type PerformancePrediction = z.infer<typeof PerformancePredictionSchema>;

export const CampaignPredictionSchema = z.object({
  total_predicted_reach: z.object({
    low: z.number(),
    expected: z.number(),
    high: z.number(),
  }),
  total_predicted_engagement: z.number().describe('Total predicted engagements'),
  total_predicted_impressions: z.number().describe('Total predicted impressions'),
  overall_engagement_rate: z.number().describe('Blended engagement rate'),
  campaign_roi: z.object({
    total_investment: z.string(),
    predicted_media_value: z.string(),
    roi_percentage: z.string(),
  }),
  per_creator_breakdown: z.array(
    z.object({
      creator_name: z.string(),
      predicted_reach: z.number(),
      predicted_engagement: z.number(),
      predicted_roi: z.string(),
      risk_level: z.enum(['low', 'medium', 'high']),
    })
  ),
  risk_factors: z.array(z.string()).describe('Risk factors that could affect predictions'),
  recommendations: z.array(z.string()).describe('Strategic recommendations to maximize performance'),
});

export type CampaignPrediction = z.infer<typeof CampaignPredictionSchema>;

export interface PredictionInput {
  creator: {
    name: string;
    platform: string;
    followers: number;
    avg_engagement_rate: number;
    avg_views?: number;
    avg_likes?: number;
    avg_comments?: number;
    niche?: string[];
  };
  content: {
    type: string;
    description?: string;
    duration_seconds?: number;
  };
  campaign: {
    name: string;
    industry?: string;
    budget?: string;
    objectives?: string[];
  };
}

export interface CampaignPredictionInput {
  campaignName: string;
  totalBudget: string;
  objectives: string[];
  creators: Array<{
    name: string;
    platform: string;
    followers: number;
    avg_engagement_rate: number;
    proposed_rate?: number;
    deliverables: Array<{ type: string; quantity: number }>;
  }>;
}

/**
 * Predict performance for a single content piece
 */
export async function predictPerformance(input: PredictionInput): Promise<PerformancePrediction> {
  const model = getBriefProcessingModel();

  const prompt = `You are an expert social media analytics specialist. Predict the performance of the following content piece.

CREATOR:
- Name: ${input.creator.name}
- Platform: ${input.creator.platform}
- Followers: ${input.creator.followers.toLocaleString()}
- Avg Engagement Rate: ${input.creator.avg_engagement_rate}%
- Avg Views: ${input.creator.avg_views?.toLocaleString() || 'Unknown'}
- Avg Likes: ${input.creator.avg_likes?.toLocaleString() || 'Unknown'}
- Avg Comments: ${input.creator.avg_comments?.toLocaleString() || 'Unknown'}
- Niche: ${input.creator.niche?.join(', ') || 'General'}

CONTENT:
- Type: ${input.content.type}
- Description: ${input.content.description || 'Standard content piece'}
- Duration: ${input.content.duration_seconds ? `${input.content.duration_seconds}s` : 'N/A'}

CAMPAIGN:
- Name: ${input.campaign.name}
- Industry: ${input.campaign.industry || 'General'}
- Budget: ${input.campaign.budget || 'Not specified'}
- Objectives: ${input.campaign.objectives?.join(', ') || 'Not specified'}

Based on platform benchmarks, creator performance data, and industry standards, predict the performance.

Return JSON:
{
  "predicted_reach": {
    "low": 5000,
    "expected": 12000,
    "high": 25000
  },
  "predicted_engagement": {
    "rate": 4.5,
    "likes": 540,
    "comments": 45,
    "shares": 20,
    "saves": 30
  },
  "predicted_roi": {
    "cost_per_impression": "$0.05",
    "cost_per_engagement": "$0.80",
    "estimated_media_value": "$3,500",
    "roi_percentage": "150%"
  },
  "confidence_level": "medium",
  "confidence_explanation": "Based on creator's consistent engagement history",
  "optimization_tips": ["Post during peak hours", "Use trending audio"],
  "best_posting_time": "Tuesday 10:00 AM EST",
  "hashtag_recommendations": ["#beauty", "#skincare"],
  "content_format_notes": "Short-form video with hook in first 3 seconds",
  "comparison": {
    "vs_creator_average": "10% above creator's average performance",
    "vs_industry_average": "Above beauty industry average of 3.2%",
    "vs_platform_average": "Top 20% for Instagram Reels in this follower range"
  }
}

Important:
- Base predictions on the creator's actual stats, not generic benchmarks
- Reach predictions should be proportional to follower count and engagement rate
- Account for platform-specific algorithms (e.g., Reels get more reach than static posts)
- Be realistic — don't over-promise
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
    return PerformancePredictionSchema.parse(parsed);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to predict performance: ${error.message}`);
    }
    throw new Error('Failed to predict performance: Unknown error');
  }
}

/**
 * Predict aggregate performance across entire campaign
 */
export async function predictCampaignPerformance(
  input: CampaignPredictionInput
): Promise<CampaignPrediction> {
  const model = getBriefProcessingModel();

  const prompt = `You are an expert campaign performance analyst. Predict the aggregate performance for this entire campaign.

CAMPAIGN: ${input.campaignName}
TOTAL BUDGET: ${input.totalBudget}
OBJECTIVES: ${input.objectives.join('; ')}

CREATORS & DELIVERABLES:
${input.creators.map((c, i) => `
Creator ${i + 1}: ${c.name}
  Platform: ${c.platform}
  Followers: ${c.followers.toLocaleString()}
  Engagement Rate: ${c.avg_engagement_rate}%
  Proposed Rate: ${c.proposed_rate ? `$${c.proposed_rate}` : 'TBD'}
  Deliverables: ${c.deliverables.map(d => `${d.quantity}x ${d.type}`).join(', ')}
`).join('')}

Predict the total campaign performance aggregating all creators and deliverables.

Return JSON:
{
  "total_predicted_reach": {"low": 100000, "expected": 250000, "high": 500000},
  "total_predicted_engagement": 15000,
  "total_predicted_impressions": 400000,
  "overall_engagement_rate": 4.2,
  "campaign_roi": {
    "total_investment": "$25,000",
    "predicted_media_value": "$75,000",
    "roi_percentage": "200%"
  },
  "per_creator_breakdown": [
    {
      "creator_name": "Name",
      "predicted_reach": 50000,
      "predicted_engagement": 3000,
      "predicted_roi": "180%",
      "risk_level": "low"
    }
  ],
  "risk_factors": ["Risk 1", "Risk 2"],
  "recommendations": ["Recommendation 1"]
}

Important:
- Aggregate numbers should be the sum of individual predictions
- Consider cross-pollination effects between creators
- Be realistic with ROI predictions
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
    return CampaignPredictionSchema.parse(parsed);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to predict campaign performance: ${error.message}`);
    }
    throw new Error('Failed to predict campaign performance: Unknown error');
  }
}
