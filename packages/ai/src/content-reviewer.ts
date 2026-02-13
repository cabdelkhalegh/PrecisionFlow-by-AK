/**
 * AI Content Reviewer
 * Analyzes submitted scripts/drafts for brand safety, brief alignment,
 * sentiment analysis, and quality scoring — flags issues before human review
 */

import { getBriefProcessingModel } from './client';
import { z } from 'zod';

export const ContentReviewSchema = z.object({
  overall_score: z.number().min(0).max(100).describe('Overall content quality score'),
  verdict: z.enum(['approve', 'minor_changes', 'major_changes', 'reject']).describe('Review verdict'),
  brief_alignment: z.object({
    score: z.number().min(0).max(100),
    matched_objectives: z.array(z.string()).describe('Objectives this content addresses'),
    missed_objectives: z.array(z.string()).describe('Objectives not addressed'),
    messaging_alignment: z.string().describe('How well the messaging aligns with brief'),
  }).describe('How well content aligns with the campaign brief'),
  brand_safety: z.object({
    score: z.number().min(0).max(100),
    is_safe: z.boolean(),
    flags: z.array(
      z.object({
        issue: z.string(),
        severity: z.enum(['low', 'medium', 'high', 'critical']),
        location: z.string().describe('Where in the content the issue is'),
        suggestion: z.string().describe('How to fix it'),
      })
    ).describe('Brand safety issues found'),
  }).describe('Brand safety analysis'),
  sentiment: z.object({
    overall: z.enum(['very_positive', 'positive', 'neutral', 'negative', 'very_negative']),
    tone: z.string().describe('Tone of the content'),
    emotional_appeal: z.string().describe('Emotional triggers used'),
    authenticity_score: z.number().min(0).max(100).describe('How authentic the content feels'),
  }).describe('Sentiment analysis'),
  quality_assessment: z.object({
    clarity: z.number().min(0).max(100).describe('How clear and understandable'),
    creativity: z.number().min(0).max(100).describe('Creative quality'),
    call_to_action: z.number().min(0).max(100).describe('Effectiveness of CTA'),
    hook_strength: z.number().min(0).max(100).describe('How strong the opening hook is'),
    storytelling: z.number().min(0).max(100).describe('Narrative quality'),
  }).describe('Content quality breakdown'),
  compliance: z.object({
    has_disclosure: z.boolean().describe('Has proper sponsorship disclosure (#ad, #sponsored)'),
    disclosure_issues: z.array(z.string()),
    platform_guidelines: z.array(z.string()).describe('Platform guideline compliance notes'),
    legal_concerns: z.array(z.string()).describe('Any legal red flags'),
  }).describe('Regulatory compliance check'),
  improvement_suggestions: z.array(
    z.object({
      area: z.string(),
      current: z.string().describe('What it currently says/does'),
      suggested: z.string().describe('What it should say/do'),
      priority: z.enum(['low', 'medium', 'high']),
      impact: z.string().describe('Expected impact of this change'),
    })
  ).describe('Specific improvement suggestions'),
  competitor_differentiation: z.string().describe('How well this differentiates from competitor content'),
  predicted_performance: z.object({
    engagement_prediction: z.enum(['below_average', 'average', 'above_average', 'exceptional']),
    reasoning: z.string(),
  }).describe('Expected content performance'),
});

export type ContentReview = z.infer<typeof ContentReviewSchema>;

export interface ContentReviewInput {
  content: string;
  contentType: 'script' | 'draft' | 'caption' | 'final';
  platform: string;
  briefContext: {
    objectives: string[];
    targetAudience: string;
    keyMessages?: string[];
    brandGuidelines?: string;
    doNots?: string[];
  };
  creatorName?: string;
  campaignName?: string;
}

/**
 * Review content against brief requirements and quality standards
 */
export async function reviewContent(input: ContentReviewInput): Promise<ContentReview> {
  const model = getBriefProcessingModel();

  const prompt = `You are an expert content reviewer for influencer marketing campaigns. Analyze the following content submission and provide a comprehensive review.

CAMPAIGN: ${input.campaignName || 'Not specified'}
CREATOR: ${input.creatorName || 'Not specified'}
CONTENT TYPE: ${input.contentType}
PLATFORM: ${input.platform}

CONTENT TO REVIEW:
---
${input.content}
---

BRIEF REQUIREMENTS:
- Objectives: ${input.briefContext.objectives.join('; ')}
- Target Audience: ${input.briefContext.targetAudience}
- Key Messages: ${input.briefContext.keyMessages?.join('; ') || 'Not specified'}
- Brand Guidelines: ${input.briefContext.brandGuidelines || 'Standard brand safety'}
- Do NOT: ${input.briefContext.doNots?.join('; ') || 'None specified'}

Perform a thorough review covering:
1. Brief alignment — does it hit the objectives?
2. Brand safety — any risky content, controversial topics, competitor mentions?
3. Sentiment analysis — tone, emotional appeal, authenticity
4. Quality assessment — clarity, creativity, CTA effectiveness, hook, storytelling
5. Compliance — sponsorship disclosure, platform guidelines, legal
6. Specific improvements — what exactly should change

Return JSON:
{
  "overall_score": 75,
  "verdict": "minor_changes",
  "brief_alignment": {
    "score": 80,
    "matched_objectives": ["Brand awareness"],
    "missed_objectives": ["Drive product trials"],
    "messaging_alignment": "Good alignment with brand voice but missing key CTA"
  },
  "brand_safety": {
    "score": 95,
    "is_safe": true,
    "flags": []
  },
  "sentiment": {
    "overall": "positive",
    "tone": "Friendly and approachable",
    "emotional_appeal": "Uses curiosity and aspiration",
    "authenticity_score": 85
  },
  "quality_assessment": {
    "clarity": 80,
    "creativity": 70,
    "call_to_action": 60,
    "hook_strength": 85,
    "storytelling": 75
  },
  "compliance": {
    "has_disclosure": true,
    "disclosure_issues": [],
    "platform_guidelines": ["Meets Instagram Reels requirements"],
    "legal_concerns": []
  },
  "improvement_suggestions": [
    {
      "area": "Call to Action",
      "current": "Link in bio",
      "suggested": "Swipe up to get 20% off with code GLOW20",
      "priority": "high",
      "impact": "Could increase conversion rate by 30%"
    }
  ],
  "competitor_differentiation": "Good use of personal storytelling that differentiates from typical beauty content",
  "predicted_performance": {
    "engagement_prediction": "above_average",
    "reasoning": "Strong hook and authentic tone should drive higher engagement"
  }
}

Important:
- Be constructive, not harsh — provide actionable suggestions
- Flag brand safety issues with specific locations in the content
- Check for proper #ad or #sponsored disclosures
- Score objectively based on content quality, not personal preference
- Consider platform-specific best practices
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
    return ContentReviewSchema.parse(parsed);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to review content: ${error.message}`);
    }
    throw new Error('Failed to review content: Unknown error');
  }
}
