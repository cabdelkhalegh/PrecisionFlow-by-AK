/**
 * AI Campaign Strategy Generator
 * Analyzes brief + client history + market context → generates full campaign strategy
 * with content pillars, posting schedule, audience targeting, and budget allocation
 */

import { getBriefProcessingModel } from './client';
import { z } from 'zod';

// Schema for generated campaign strategy
export const CampaignStrategySchema = z.object({
  executive_summary: z.string().describe('High-level campaign strategy overview'),
  content_pillars: z.array(
    z.object({
      name: z.string().describe('Pillar name'),
      description: z.string().describe('What this pillar covers'),
      percentage: z.number().describe('Percentage of total content allocation'),
      content_types: z.array(z.string()).describe('Types of content for this pillar'),
      example_topics: z.array(z.string()).describe('Example content topics'),
    })
  ).describe('Strategic content pillars'),
  posting_schedule: z.object({
    frequency: z.string().describe('Recommended posting frequency'),
    best_days: z.array(z.string()).describe('Best days to post'),
    best_times: z.array(z.string()).describe('Best times to post (timezone-aware)'),
    platform_cadence: z.array(
      z.object({
        platform: z.string(),
        posts_per_week: z.number(),
        content_types: z.array(z.string()),
      })
    ).describe('Per-platform posting cadence'),
  }).describe('Recommended posting schedule'),
  audience_strategy: z.object({
    primary_audience: z.object({
      demographics: z.string(),
      psychographics: z.string(),
      platforms: z.array(z.string()),
      interests: z.array(z.string()),
    }),
    secondary_audience: z.object({
      demographics: z.string(),
      psychographics: z.string(),
      platforms: z.array(z.string()),
      interests: z.array(z.string()),
    }).optional(),
    messaging_angles: z.array(z.string()).describe('Key messaging angles to resonate with audience'),
  }).describe('Audience targeting strategy'),
  budget_allocation: z.array(
    z.object({
      category: z.string().describe('Budget category'),
      percentage: z.number().describe('Percentage of total budget'),
      rationale: z.string().describe('Why this allocation'),
    })
  ).describe('Recommended budget allocation'),
  creator_profile: z.object({
    ideal_follower_range: z.string().describe('Ideal follower count range'),
    min_engagement_rate: z.number().describe('Minimum engagement rate percentage'),
    preferred_platforms: z.array(z.string()),
    preferred_niches: z.array(z.string()),
    content_style: z.array(z.string()).describe('Preferred content styles'),
    creator_count: z.number().describe('Recommended number of creators'),
  }).describe('Ideal creator profile for this campaign'),
  kpi_targets: z.array(
    z.object({
      metric: z.string(),
      target: z.string(),
      measurement_method: z.string(),
    })
  ).describe('Specific KPI targets with measurement methods'),
  risk_mitigation: z.array(
    z.object({
      risk: z.string(),
      likelihood: z.enum(['low', 'medium', 'high']),
      impact: z.enum(['low', 'medium', 'high']),
      mitigation: z.string(),
    })
  ).describe('Risk mitigation strategies'),
  timeline_phases: z.array(
    z.object({
      phase: z.string(),
      duration: z.string(),
      activities: z.array(z.string()),
      milestones: z.array(z.string()),
    })
  ).describe('Campaign execution timeline phases'),
  competitive_positioning: z.string().describe('How to differentiate from competitors'),
  success_criteria: z.array(z.string()).describe('What defines campaign success'),
});

export type CampaignStrategy = z.infer<typeof CampaignStrategySchema>;

export interface StrategyInput {
  briefData: {
    objectives: string[];
    target_audience: string;
    deliverables: Array<{ type: string; quantity: number; description: string; deadline?: string }>;
    timeline: string;
    budget: string;
    kpis: string[];
  };
  clientInfo?: {
    name: string;
    industry?: string;
    tier?: string;
    previousCampaigns?: number;
  };
  campaignName: string;
}

/**
 * Generate a comprehensive campaign strategy from brief data and context
 */
export async function generateStrategy(input: StrategyInput): Promise<CampaignStrategy> {
  const model = getBriefProcessingModel();

  const clientContext = input.clientInfo
    ? `\nCLIENT CONTEXT:
- Company: ${input.clientInfo.name}
- Industry: ${input.clientInfo.industry || 'Not specified'}
- Tier: ${input.clientInfo.tier || 'Not specified'}
- Previous campaigns: ${input.clientInfo.previousCampaigns ?? 'Unknown'}`
    : '';

  const prompt = `You are an elite influencer marketing strategist. Generate a comprehensive campaign strategy based on the following brief data.

CAMPAIGN: ${input.campaignName}
${clientContext}

BRIEF DATA:
- Objectives: ${input.briefData.objectives.join('; ')}
- Target Audience: ${input.briefData.target_audience}
- Deliverables: ${input.briefData.deliverables.map(d => `${d.quantity}x ${d.type}: ${d.description}`).join('; ')}
- Timeline: ${input.briefData.timeline}
- Budget: ${input.briefData.budget}
- KPIs: ${input.briefData.kpis.join('; ')}

Generate a complete campaign strategy in JSON format with these fields:
{
  "executive_summary": "Brief strategic overview of the campaign approach",
  "content_pillars": [
    {
      "name": "Pillar name",
      "description": "What this pillar covers",
      "percentage": 40,
      "content_types": ["Reels", "Stories"],
      "example_topics": ["Topic 1", "Topic 2"]
    }
  ],
  "posting_schedule": {
    "frequency": "3-5 posts per week",
    "best_days": ["Tuesday", "Thursday", "Saturday"],
    "best_times": ["10:00 AM EST", "7:00 PM EST"],
    "platform_cadence": [
      {"platform": "Instagram", "posts_per_week": 3, "content_types": ["Reels", "Stories", "Carousel"]}
    ]
  },
  "audience_strategy": {
    "primary_audience": {
      "demographics": "Age, gender, location description",
      "psychographics": "Values, interests, behavior patterns",
      "platforms": ["Instagram", "TikTok"],
      "interests": ["beauty", "lifestyle"]
    },
    "messaging_angles": ["Angle 1", "Angle 2"]
  },
  "budget_allocation": [
    {"category": "Creator Fees", "percentage": 60, "rationale": "Why this amount"}
  ],
  "creator_profile": {
    "ideal_follower_range": "10K-100K",
    "min_engagement_rate": 3.5,
    "preferred_platforms": ["Instagram"],
    "preferred_niches": ["beauty"],
    "content_style": ["authentic", "tutorial"],
    "creator_count": 5
  },
  "kpi_targets": [
    {"metric": "Engagement Rate", "target": ">5%", "measurement_method": "Platform analytics"}
  ],
  "risk_mitigation": [
    {"risk": "Low engagement", "likelihood": "medium", "impact": "high", "mitigation": "Strategy to mitigate"}
  ],
  "timeline_phases": [
    {"phase": "Phase 1: Setup", "duration": "2 weeks", "activities": ["Activity 1"], "milestones": ["Milestone 1"]}
  ],
  "competitive_positioning": "How to stand out in the market",
  "success_criteria": ["Criterion 1", "Criterion 2"]
}

Important:
- Be specific and actionable — no generic advice
- Budget percentages must sum to 100
- Content pillar percentages must sum to 100
- Align all recommendations with the stated objectives and KPIs
- Consider the industry context and audience for platform selection
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
    return CampaignStrategySchema.parse(parsed);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to generate strategy: ${error.message}`);
    }
    throw new Error('Failed to generate strategy: Unknown error');
  }
}
