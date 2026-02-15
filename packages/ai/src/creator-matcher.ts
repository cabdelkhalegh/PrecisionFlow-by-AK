/**
 * Smart Creator Matching Engine
 * AI-powered scoring and ranking of creators against campaign requirements
 * Analyzes audience fit, niche alignment, engagement quality, and rate efficiency
 */

import { getBriefProcessingModel } from './client';
import { z } from 'zod';

// Schema for creator match scoring
export const CreatorMatchScoreSchema = z.object({
  creator_id: z.string(),
  overall_score: z.number().min(0).max(100).describe('Overall match score 0-100'),
  breakdown: z.object({
    audience_fit: z.number().min(0).max(100).describe('How well creator audience matches target'),
    niche_alignment: z.number().min(0).max(100).describe('Content niche relevance'),
    engagement_quality: z.number().min(0).max(100).describe('Engagement rate and quality score'),
    rate_efficiency: z.number().min(0).max(100).describe('Value for money relative to reach'),
    platform_match: z.number().min(0).max(100).describe('Platform relevance for campaign'),
    content_style: z.number().min(0).max(100).describe('Content style alignment'),
  }),
  reasoning: z.string().describe('AI explanation of why this creator matches or not'),
  strengths: z.array(z.string()).describe('Creator strengths for this campaign'),
  concerns: z.array(z.string()).describe('Potential concerns or risks'),
  recommended_deliverables: z.array(
    z.object({
      type: z.string(),
      quantity: z.number(),
      estimated_reach: z.string(),
      rationale: z.string(),
    })
  ).describe('Recommended deliverables for this creator'),
  suggested_rate: z.string().describe('AI-suggested rate based on market analysis'),
});

export type CreatorMatchScore = z.infer<typeof CreatorMatchScoreSchema>;

export const CreatorMatchResultSchema = z.object({
  matches: z.array(CreatorMatchScoreSchema),
  campaign_fit_summary: z.string().describe('Overall assessment of the shortlist'),
  recommendations: z.array(z.string()).describe('Strategic recommendations for creator selection'),
  gaps: z.array(z.string()).describe('Identified gaps in the current shortlist'),
});

export type CreatorMatchResult = z.infer<typeof CreatorMatchResultSchema>;

export interface CreatorProfile {
  id: string;
  name: string;
  primary_platform?: string;
  niche?: string[];
  instagram_followers?: number;
  tiktok_followers?: number;
  youtube_subscribers?: number;
  twitter_followers?: number;
  avg_engagement_rate?: number;
  avg_views?: number;
  content_types?: string[];
  rate_card?: Record<string, number>;
  bio?: string;
  country?: string;
  city?: string;
  total_campaigns_completed?: number;
}

export interface MatchCriteria {
  campaignName: string;
  objectives: string[];
  targetAudience: string;
  deliverables: Array<{ type: string; quantity: number; description: string }>;
  budget: string;
  preferredPlatforms?: string[];
  preferredNiches?: string[];
  minEngagementRate?: number;
}

/**
 * Score and rank creators against campaign requirements using AI
 */
export async function matchCreators(
  creators: CreatorProfile[],
  criteria: MatchCriteria
): Promise<CreatorMatchResult> {
  const model = getBriefProcessingModel();

  const creatorsData = creators.map((c) => ({
    id: c.id,
    name: c.name,
    platform: c.primary_platform || 'unknown',
    niches: c.niche?.join(', ') || 'general',
    followers: {
      instagram: c.instagram_followers || 0,
      tiktok: c.tiktok_followers || 0,
      youtube: c.youtube_subscribers || 0,
      twitter: c.twitter_followers || 0,
    },
    engagement_rate: c.avg_engagement_rate || 0,
    avg_views: c.avg_views || 0,
    content_types: c.content_types?.join(', ') || 'various',
    rate_card: c.rate_card ? JSON.stringify(c.rate_card) : 'not specified',
    bio: c.bio?.substring(0, 200) || '',
    location: [c.country, c.city].filter(Boolean).join(', ') || 'unknown',
    campaigns_completed: c.total_campaigns_completed || 0,
  }));

  const prompt = `You are an expert influencer marketing matchmaker. Score and rank the following creators against the campaign requirements.

CAMPAIGN: ${criteria.campaignName}
OBJECTIVES: ${criteria.objectives.join('; ')}
TARGET AUDIENCE: ${criteria.targetAudience}
DELIVERABLES: ${criteria.deliverables.map(d => `${d.quantity}x ${d.type}: ${d.description}`).join('; ')}
BUDGET: ${criteria.budget}
PREFERRED PLATFORMS: ${criteria.preferredPlatforms?.join(', ') || 'Any'}
PREFERRED NICHES: ${criteria.preferredNiches?.join(', ') || 'Any'}
MIN ENGAGEMENT: ${criteria.minEngagementRate || 'No minimum'}%

CREATORS TO EVALUATE:
${JSON.stringify(creatorsData, null, 2)}

Score each creator on a 0-100 scale across these dimensions:
- audience_fit: How well their audience matches the campaign's target audience
- niche_alignment: How relevant their content niche is to the campaign
- engagement_quality: Quality of their engagement relative to their size
- rate_efficiency: Value for money considering their reach and engagement
- platform_match: How well their primary platform aligns with campaign needs
- content_style: How well their content style fits the campaign aesthetic

Return JSON:
{
  "matches": [
    {
      "creator_id": "id",
      "overall_score": 85,
      "breakdown": {
        "audience_fit": 90,
        "niche_alignment": 80,
        "engagement_quality": 85,
        "rate_efficiency": 75,
        "platform_match": 95,
        "content_style": 80
      },
      "reasoning": "Detailed explanation of the score",
      "strengths": ["Strength 1", "Strength 2"],
      "concerns": ["Concern 1"],
      "recommended_deliverables": [
        {"type": "Instagram Reel", "quantity": 2, "estimated_reach": "50K", "rationale": "Strong reel performance"}
      ],
      "suggested_rate": "$1,500 per post"
    }
  ],
  "campaign_fit_summary": "Overall assessment of how well the shortlist serves the campaign",
  "recommendations": ["Strategic rec 1", "Strategic rec 2"],
  "gaps": ["Gap 1 - missing micro-influencer representation"]
}

Important:
- Sort matches by overall_score descending (best first)
- overall_score should be a weighted average: audience_fit 25%, engagement_quality 20%, niche_alignment 20%, platform_match 15%, content_style 10%, rate_efficiency 10%
- Be specific in reasoning — reference actual creator stats
- Suggested rate should be realistic for the creator's size and platform
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
    return CreatorMatchResultSchema.parse(parsed);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to match creators: ${error.message}`);
    }
    throw new Error('Failed to match creators: Unknown error');
  }
}
