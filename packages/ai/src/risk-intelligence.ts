/**
 * Campaign Risk Intelligence Engine
 * Continuous risk monitoring across budget burn rate, deadline proximity,
 * approval bottlenecks, creator delivery patterns, and overall campaign health
 */

import { getBriefProcessingModel } from './client';
import { z } from 'zod';

export const RiskIntelligenceSchema = z.object({
  overall_risk_score: z.number().min(0).max(100).describe('Overall campaign risk 0-100 (higher = more risk)'),
  risk_level: z.enum(['low', 'medium', 'high', 'critical']),
  health_status: z.enum(['healthy', 'at_risk', 'critical', 'blocked']),
  risk_factors: z.array(
    z.object({
      category: z.enum(['budget', 'timeline', 'delivery', 'approval', 'quality', 'creator', 'external']),
      title: z.string(),
      description: z.string(),
      severity: z.enum(['low', 'medium', 'high', 'critical']),
      probability: z.enum(['unlikely', 'possible', 'likely', 'certain']),
      impact: z.string(),
      mitigation: z.string(),
      action_required: z.boolean(),
      deadline: z.string().optional(),
    })
  ).describe('Identified risk factors'),
  budget_analysis: z.object({
    burn_rate: z.string().describe('Current spending rate'),
    projected_overspend: z.boolean(),
    overspend_amount: z.string().optional(),
    days_until_budget_exhausted: z.number().optional(),
    recommendation: z.string(),
  }).describe('Budget risk analysis'),
  timeline_analysis: z.object({
    days_remaining: z.number(),
    tasks_behind_schedule: z.number(),
    critical_path_items: z.array(z.string()),
    projected_completion: z.string(),
    on_track: z.boolean(),
  }).describe('Timeline risk analysis'),
  approval_bottlenecks: z.array(
    z.object({
      item: z.string(),
      waiting_since: z.string(),
      blocker: z.string(),
      impact_if_delayed: z.string(),
      suggested_action: z.string(),
    })
  ).describe('Approval bottlenecks identified'),
  creator_risk: z.array(
    z.object({
      creator_name: z.string(),
      risk: z.string(),
      severity: z.enum(['low', 'medium', 'high']),
      recommendation: z.string(),
    })
  ).describe('Creator-specific risks'),
  action_items: z.array(
    z.object({
      priority: z.enum(['immediate', 'this_week', 'this_month']),
      action: z.string(),
      assigned_to: z.string(),
      impact: z.string(),
    })
  ).describe('Prioritized action items'),
  trend: z.enum(['improving', 'stable', 'declining']).describe('Risk trend direction'),
  executive_summary: z.string().describe('Executive-level risk summary'),
});

export type RiskIntelligence = z.infer<typeof RiskIntelligenceSchema>;

export interface RiskAnalysisInput {
  campaign: {
    name: string;
    status: string;
    startDate?: string;
    endDate?: string;
    budgetTotal?: number;
    actualSpent?: number;
    riskLevel?: string;
  };
  tasks: Array<{
    title: string;
    status: string;
    deadline?: string;
    creatorName?: string;
    deliverableType?: string;
  }>;
  approvals: Array<{
    type: string;
    status: string;
    createdAt?: string;
    approverName?: string;
  }>;
  creators: Array<{
    name: string;
    tasksAssigned: number;
    tasksCompleted: number;
    avgDeliveryTime?: string;
  }>;
  expenses: {
    total: number;
    approved: number;
    pending: number;
  };
}

/**
 * Perform comprehensive risk intelligence analysis for a campaign
 */
export async function analyzeRisk(input: RiskAnalysisInput): Promise<RiskIntelligence> {
  const model = getBriefProcessingModel();

  const now = new Date().toISOString().split('T')[0];
  const budgetUsed = input.campaign.budgetTotal && input.campaign.budgetTotal > 0
    ? ((input.campaign.actualSpent || 0) / input.campaign.budgetTotal * 100).toFixed(1)
    : 'unknown';

  const pendingApprovals = input.approvals.filter(a => a.status === 'pending');
  const tasksBehind = input.tasks.filter(t => {
    if (!t.deadline) return false;
    return new Date(t.deadline) < new Date() && !['approved', 'published', 'cancelled'].includes(t.status);
  });

  const prompt = `You are a campaign risk intelligence analyst. Analyze the following campaign data and provide a comprehensive risk assessment.

TODAY'S DATE: ${now}

CAMPAIGN:
- Name: ${input.campaign.name}
- Status: ${input.campaign.status}
- Start Date: ${input.campaign.startDate || 'Not set'}
- End Date: ${input.campaign.endDate || 'Not set'}
- Budget: $${input.campaign.budgetTotal?.toLocaleString() || 'Not set'}
- Spent: $${input.campaign.actualSpent?.toLocaleString() || '0'}
- Budget Used: ${budgetUsed}%
- Current Risk: ${input.campaign.riskLevel || 'unknown'}

CONTENT TASKS (${input.tasks.length} total, ${tasksBehind.length} behind schedule):
${input.tasks.map(t => `- ${t.title} | Status: ${t.status} | Deadline: ${t.deadline || 'none'} | Creator: ${t.creatorName || 'unassigned'} | Type: ${t.deliverableType || 'unknown'}`).join('\n')}

APPROVALS (${pendingApprovals.length} pending):
${input.approvals.map(a => `- ${a.type} | Status: ${a.status} | Created: ${a.createdAt || 'unknown'} | Approver: ${a.approverName || 'unknown'}`).join('\n')}

CREATORS:
${input.creators.map(c => `- ${c.name} | Tasks: ${c.tasksAssigned} assigned, ${c.tasksCompleted} completed | Avg Delivery: ${c.avgDeliveryTime || 'unknown'}`).join('\n')}

EXPENSES:
- Total: $${input.expenses.total.toLocaleString()}
- Approved: $${input.expenses.approved.toLocaleString()}
- Pending: $${input.expenses.pending.toLocaleString()}

Provide a comprehensive risk intelligence report.

Return JSON:
{
  "overall_risk_score": 45,
  "risk_level": "medium",
  "health_status": "at_risk",
  "risk_factors": [
    {
      "category": "budget",
      "title": "Budget burn rate above forecast",
      "description": "Current spending pace will exceed budget by 15%",
      "severity": "high",
      "probability": "likely",
      "impact": "Budget overrun requiring additional approval",
      "mitigation": "Review remaining deliverables and negotiate rates",
      "action_required": true,
      "deadline": "2026-03-01"
    }
  ],
  "budget_analysis": {
    "burn_rate": "$5,000/week",
    "projected_overspend": true,
    "overspend_amount": "$7,500",
    "days_until_budget_exhausted": 18,
    "recommendation": "Reduce scope or request budget increase"
  },
  "timeline_analysis": {
    "days_remaining": 30,
    "tasks_behind_schedule": 3,
    "critical_path_items": ["Final video delivery", "Client approval"],
    "projected_completion": "2026-03-15 (5 days late)",
    "on_track": false
  },
  "approval_bottlenecks": [
    {
      "item": "Content approval for Creator X",
      "waiting_since": "5 days",
      "blocker": "Director review pending",
      "impact_if_delayed": "Delays publishing by 1 week",
      "suggested_action": "Escalate to director or use override"
    }
  ],
  "creator_risk": [
    {
      "creator_name": "Creator X",
      "risk": "2 out of 3 deliverables behind schedule",
      "severity": "high",
      "recommendation": "Schedule check-in call and establish interim deadlines"
    }
  ],
  "action_items": [
    {
      "priority": "immediate",
      "action": "Approve pending content for Creator X",
      "assigned_to": "Campaign Director",
      "impact": "Unblocks publishing pipeline"
    }
  ],
  "trend": "declining",
  "executive_summary": "Campaign has moderate risk due to budget pressure and approval delays."
}

Important:
- Base analysis on actual data provided — don't invent issues
- Prioritize action items by urgency and impact
- Be specific about deadlines and responsible parties
- Consider cascading effects (one delay causing others)
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
    return RiskIntelligenceSchema.parse(parsed);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to analyze risk: ${error.message}`);
    }
    throw new Error('Failed to analyze risk: Unknown error');
  }
}
