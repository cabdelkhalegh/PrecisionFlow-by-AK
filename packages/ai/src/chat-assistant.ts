/**
 * AI Chat Assistant
 * Natural language interface for querying campaign data,
 * getting summaries, and asking questions about any campaign
 */

import { getBriefProcessingModel } from './client';
import { z } from 'zod';

export const ChatResponseSchema = z.object({
  answer: z.string().describe('The AI assistant response'),
  data_referenced: z.array(z.string()).describe('What data sources were used'),
  suggested_actions: z.array(
    z.object({
      action: z.string(),
      link: z.string().optional(),
      priority: z.enum(['low', 'medium', 'high']).optional(),
    })
  ).describe('Suggested follow-up actions'),
  follow_up_questions: z.array(z.string()).describe('Suggested follow-up questions'),
  confidence: z.enum(['low', 'medium', 'high']).describe('Confidence in the answer'),
});

export type ChatResponse = z.infer<typeof ChatResponseSchema>;

export interface ChatContext {
  campaigns?: Array<{
    id: string;
    name: string;
    status: string;
    clientName?: string;
    budget?: number;
    spent?: number;
    riskLevel?: string;
    startDate?: string;
    endDate?: string;
    tasksTotal?: number;
    tasksCompleted?: number;
    creatorsCount?: number;
    pendingApprovals?: number;
  }>;
  clients?: Array<{
    id: string;
    name: string;
    tier?: string;
    campaignCount?: number;
  }>;
  creators?: Array<{
    id: string;
    name: string;
    platform?: string;
    followers?: number;
    engagementRate?: number;
  }>;
  recentActivity?: Array<{
    action: string;
    entity: string;
    timestamp: string;
  }>;
  financialSummary?: {
    totalBudgeted: number;
    totalSpent: number;
    totalInvoiced: number;
    totalPaid: number;
  };
  pendingApprovals?: number;
  userName?: string;
  userRole?: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

/**
 * Process a natural language query about campaign data
 */
export async function chat(
  message: string,
  context: ChatContext,
  history: ChatMessage[] = []
): Promise<ChatResponse> {
  const model = getBriefProcessingModel();

  const conversationHistory = history.length > 0
    ? `\nCONVERSATION HISTORY:\n${history.map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`).join('\n')}\n`
    : '';

  const campaignContext = context.campaigns?.length
    ? `\nCAMPAIGNS (${context.campaigns.length}):\n${context.campaigns.map(c =>
        `- ${c.name} | Status: ${c.status} | Client: ${c.clientName || 'N/A'} | Budget: $${c.budget?.toLocaleString() || '0'} (spent $${c.spent?.toLocaleString() || '0'}) | Risk: ${c.riskLevel || 'unknown'} | Dates: ${c.startDate || '?'} to ${c.endDate || '?'} | Tasks: ${c.tasksCompleted || 0}/${c.tasksTotal || 0} | Creators: ${c.creatorsCount || 0} | Pending Approvals: ${c.pendingApprovals || 0}`
      ).join('\n')}`
    : '';

  const clientContext = context.clients?.length
    ? `\nCLIENTS (${context.clients.length}):\n${context.clients.map(c =>
        `- ${c.name} | Tier: ${c.tier || 'N/A'} | Campaigns: ${c.campaignCount || 0}`
      ).join('\n')}`
    : '';

  const creatorContext = context.creators?.length
    ? `\nCREATORS (${context.creators.length}):\n${context.creators.map(c =>
        `- ${c.name} | Platform: ${c.platform || 'N/A'} | Followers: ${c.followers?.toLocaleString() || 'N/A'} | Engagement: ${c.engagementRate || 'N/A'}%`
      ).join('\n')}`
    : '';

  const financialContext = context.financialSummary
    ? `\nFINANCIALS:\n- Total Budgeted: $${context.financialSummary.totalBudgeted.toLocaleString()}\n- Total Spent: $${context.financialSummary.totalSpent.toLocaleString()}\n- Total Invoiced: $${context.financialSummary.totalInvoiced.toLocaleString()}\n- Total Paid: $${context.financialSummary.totalPaid.toLocaleString()}`
    : '';

  const activityContext = context.recentActivity?.length
    ? `\nRECENT ACTIVITY:\n${context.recentActivity.slice(0, 10).map(a => `- ${a.action} on ${a.entity} at ${a.timestamp}`).join('\n')}`
    : '';

  const prompt = `You are PrecisionFlow AI, an intelligent assistant for influencer marketing campaign management. You have access to the following data about the user's campaigns, clients, and creators.

USER: ${context.userName || 'Team Member'} (${context.userRole || 'campaign_manager'})
PENDING APPROVALS: ${context.pendingApprovals || 0}
${campaignContext}${clientContext}${creatorContext}${financialContext}${activityContext}
${conversationHistory}

USER QUESTION: ${message}

Answer the user's question based on the data provided. Be helpful, specific, and data-driven.

Return JSON:
{
  "answer": "Your detailed response here. Use markdown formatting for readability.",
  "data_referenced": ["campaigns", "financials"],
  "suggested_actions": [
    {"action": "Review pending approvals", "link": "/approvals/pending", "priority": "high"}
  ],
  "follow_up_questions": [
    "Would you like to see the creator breakdown?",
    "Should I analyze the budget variance?"
  ],
  "confidence": "high"
}

Important:
- Reference specific data points from the context (campaign names, numbers, dates)
- If you don't have enough data to answer, say so honestly and suggest what data would help
- Provide actionable suggestions with links where possible
- Keep answers concise but thorough
- Use markdown formatting in the answer for readability (headers, bold, lists)
- Suggest relevant follow-up questions to guide the conversation
- Return valid JSON only, no markdown formatting around the JSON

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
    return ChatResponseSchema.parse(parsed);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`AI chat failed: ${error.message}`);
    }
    throw new Error('AI chat failed: Unknown error');
  }
}
