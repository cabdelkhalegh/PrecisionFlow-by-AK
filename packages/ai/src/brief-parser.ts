/**
 * Brief parsing utilities using Google Gemini AI
 */

import { getBriefProcessingModel } from './client';
import { z } from 'zod';

// Schema for structured brief data
export const StructuredBriefSchema = z.object({
  objectives: z.array(z.string()).describe('Campaign objectives and goals'),
  target_audience: z.string().describe('Target audience description'),
  deliverables: z.array(
    z.object({
      type: z.string().describe('Type of deliverable (e.g., Instagram Post, TikTok Video)'),
      quantity: z.number().describe('Number of this deliverable'),
      description: z.string().describe('Description of the deliverable'),
      deadline: z.string().optional().describe('Deadline if specified'),
    })
  ).describe('List of campaign deliverables'),
  timeline: z.string().describe('Overall campaign timeline'),
  budget: z.string().describe('Budget information'),
  kpis: z.array(z.string()).describe('Key Performance Indicators'),
  missing_info: z.array(z.string()).optional().describe('Information missing from the brief'),
});

export type StructuredBrief = z.infer<typeof StructuredBriefSchema>;

/**
 * Parse a raw campaign brief into structured data using Gemini AI
 */
export async function parseBrief(rawBrief: string): Promise<StructuredBrief> {
  const model = getBriefProcessingModel();

  const prompt = `You are an expert campaign manager assistant. Analyze the following campaign brief and extract structured information.

BRIEF:
${rawBrief}

Extract and return the following information in JSON format:
{
  "objectives": ["objective 1", "objective 2", ...],
  "target_audience": "description of target audience",
  "deliverables": [
    {
      "type": "type of content (e.g., Instagram Post, TikTok Video)",
      "quantity": number,
      "description": "description",
      "deadline": "deadline if mentioned" (optional)
    }
  ],
  "timeline": "overall campaign timeline",
  "budget": "budget information",
  "kpis": ["KPI 1", "KPI 2", ...],
  "missing_info": ["missing item 1", "missing item 2", ...] (optional - only if information is clearly missing)
}

Important:
- Extract only information that is explicitly stated in the brief
- For missing_info, only include critical information that is needed but not provided
- Be precise and factual
- Return valid JSON only, no markdown formatting

JSON:`;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    // Clean up the response (remove markdown code blocks if present)
    let jsonText = text.trim();
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/```json\n?/, '').replace(/```\n?$/, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```\n?/, '').replace(/```\n?$/, '');
    }

    // Parse JSON
    const parsed = JSON.parse(jsonText);

    // Validate with Zod schema
    const validated = StructuredBriefSchema.parse(parsed);

    return validated;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to parse brief with AI: ${error.message}`);
    }
    throw new Error('Failed to parse brief with AI: Unknown error');
  }
}

/**
 * Calculate risk level based on missing information
 */
export function calculateRiskLevel(missingInfo?: string[]): 'low' | 'medium' | 'high' | 'critical' {
  if (!missingInfo || missingInfo.length === 0) {
    return 'low';
  }

  // Critical missing info keywords - use RegExp for faster matching
  const criticalPattern = /\b(budget|timeline|deadline|deliverables)\b/i;
  const highRiskPattern = /\b(objective|target|audience|kpi)\b/i;
  const mediumRiskPattern = /\b(contact|guidelines|brand)\b/i;

  let criticalCount = 0;
  let highCount = 0;
  let mediumCount = 0;

  // Single pass through missing info with optimized pattern matching
  for (const missing of missingInfo) {
    if (criticalPattern.test(missing)) {
      criticalCount++;
    } else if (highRiskPattern.test(missing)) {
      highCount++;
    } else if (mediumRiskPattern.test(missing)) {
      mediumCount++;
    }
  }

  // Determine risk level
  if (criticalCount >= 2) return 'critical';
  if (criticalCount >= 1 || highCount >= 3) return 'high';
  if (highCount >= 1 || mediumCount >= 3) return 'medium';
  if (missingInfo.length >= 5) return 'medium';
  
  return 'low';
}
