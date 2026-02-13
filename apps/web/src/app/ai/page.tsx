'use client';

import { useState } from 'react';
import Link from 'next/link';
import { trpc } from '@/lib/trpc';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
  suggestedActions?: Array<{ action: string; link?: string; priority?: string }>;
  followUpQuestions?: string[];
};

export default function AIHubPage() {
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  const chatMutation = trpc.ai.chat.useMutation({
    onSuccess: (data) => {
      setChatMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: data.answer,
          suggestedActions: data.suggested_actions,
          followUpQuestions: data.follow_up_questions,
        },
      ]);
    },
  });

  const campaignsQuery = trpc.campaigns.list.useQuery({ limit: 10, offset: 0 });

  const handleSendChat = () => {
    if (!chatInput.trim() || chatMutation.isPending) return;
    const message = chatInput.trim();
    setChatMessages((prev) => [...prev, { role: 'user', content: message }]);
    setChatInput('');

    const history = chatMessages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    chatMutation.mutate({ message, history });
  };

  const handleFollowUp = (question: string) => {
    setChatInput(question);
  };

  const aiFeatures = [
    {
      title: 'Strategy Generator',
      description: 'Generate full campaign strategies from brief data with content pillars, scheduling, and budget allocation',
      icon: '🧠',
      color: 'blue',
      link: null,
      requiresCampaign: true,
    },
    {
      title: 'Creator Matching',
      description: 'AI-powered scoring and ranking of creators against campaign requirements',
      icon: '🎯',
      color: 'purple',
      link: null,
      requiresCampaign: true,
    },
    {
      title: 'Performance Predictor',
      description: 'Predict reach, engagement, and ROI before content goes live',
      icon: '📈',
      color: 'green',
      link: null,
      requiresCampaign: true,
    },
    {
      title: 'Content Reviewer',
      description: 'AI review for brand safety, brief alignment, sentiment, and quality scoring',
      icon: '✅',
      color: 'orange',
      link: null,
      requiresCampaign: true,
    },
    {
      title: 'Risk Intelligence',
      description: 'Continuous monitoring of budget, timeline, approvals, and delivery risks',
      icon: '🛡️',
      color: 'red',
      link: null,
      requiresCampaign: true,
    },
    {
      title: 'Learning Engine',
      description: 'Extract post-campaign learnings, success patterns, and improvement recommendations',
      icon: '📚',
      color: 'indigo',
      link: null,
      requiresCampaign: true,
    },
  ];

  const colorMap: Record<string, string> = {
    blue: 'bg-blue-50 border-blue-200 hover:border-blue-400',
    purple: 'bg-purple-50 border-purple-200 hover:border-purple-400',
    green: 'bg-green-50 border-green-200 hover:border-green-400',
    orange: 'bg-orange-50 border-orange-200 hover:border-orange-400',
    red: 'bg-red-50 border-red-200 hover:border-red-400',
    indigo: 'bg-indigo-50 border-indigo-200 hover:border-indigo-400',
  };

  return (
    <AppLayout>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            🤖 AI Intelligence Hub
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            7 AI-powered modules to supercharge your influencer marketing campaigns.
            Powered by Google Gemini 2.0 Flash.
          </p>
        </div>

        {/* AI Features Grid */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">AI Capabilities</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {aiFeatures.map((feature) => (
              <div
                key={feature.title}
                className={`rounded-lg border-2 p-5 transition-colors ${colorMap[feature.color]}`}
              >
                <div className="text-3xl mb-3">{feature.icon}</div>
                <h3 className="font-semibold text-gray-900 mb-1">{feature.title}</h3>
                <p className="text-sm text-gray-600 mb-3">{feature.description}</p>
                {feature.requiresCampaign && (
                  <Badge size="sm" variant="default">
                    Per Campaign
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Quick Access: Campaign AI */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Launch AI for a Campaign
          </h2>
          {campaignsQuery.isLoading ? (
            <div className="text-gray-500">Loading campaigns...</div>
          ) : campaignsQuery.data?.campaigns.length === 0 ? (
            <Card>
              <p className="text-gray-500 text-center py-4">
                No campaigns yet. Create a campaign first to use AI features.
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {campaignsQuery.data?.campaigns.slice(0, 6).map((campaign) => (
                <Link
                  key={campaign.id}
                  href={`/campaigns/${campaign.id}/ai`}
                  className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 hover:bg-blue-50 hover:border-blue-300 transition-colors"
                >
                  <div>
                    <h3 className="font-medium text-gray-900">{campaign.name}</h3>
                    <p className="text-xs text-gray-500 capitalize">
                      {campaign.status?.replace(/_/g, ' ')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        campaign.risk_level === 'low'
                          ? 'success'
                          : campaign.risk_level === 'medium'
                            ? 'warning'
                            : 'danger'
                      }
                      size="sm"
                    >
                      {campaign.risk_level}
                    </Badge>
                    <span className="text-blue-500">🤖</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* AI Chat */}
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            🤖 AI Assistant
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            Ask anything about your campaigns, clients, creators, or finances.
          </p>

          {/* Chat Messages */}
          <div className="mb-4 max-h-96 overflow-y-auto space-y-3">
            {chatMessages.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                <div className="text-4xl mb-2">🤖</div>
                <p className="text-sm">
                  Ask me anything! Try &quot;How are my campaigns performing?&quot; or
                  &quot;Which campaigns are at risk?&quot;
                </p>
              </div>
            )}
            {chatMessages.map((msg, i) => (
              <div
                key={i}
                className={`rounded-lg p-3 ${
                  msg.role === 'user'
                    ? 'bg-blue-50 text-blue-900 ml-12'
                    : 'bg-gray-50 text-gray-900 mr-12'
                }`}
              >
                <div className="text-xs font-medium mb-1">
                  {msg.role === 'user' ? 'You' : '🤖 AI Assistant'}
                </div>
                <div className="text-sm whitespace-pre-wrap">{msg.content}</div>

                {/* Suggested Actions */}
                {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {msg.suggestedActions.map((action, j) => (
                      <span key={j}>
                        {action.link ? (
                          <Link
                            href={action.link}
                            className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700 hover:bg-blue-200"
                          >
                            {action.action}
                          </Link>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                            {action.action}
                          </span>
                        )}
                      </span>
                    ))}
                  </div>
                )}

                {/* Follow-up Questions */}
                {msg.followUpQuestions && msg.followUpQuestions.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {msg.followUpQuestions.map((q, j) => (
                      <button
                        key={j}
                        onClick={() => handleFollowUp(q)}
                        className="text-xs text-blue-600 hover:text-blue-800 underline"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {chatMutation.isPending && (
              <div className="bg-gray-50 rounded-lg p-3 mr-12">
                <div className="text-xs font-medium mb-1">🤖 AI Assistant</div>
                <div className="text-sm text-gray-500 animate-pulse">Thinking...</div>
              </div>
            )}
          </div>

          {/* Chat Input */}
          <div className="flex gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
              placeholder="Ask about your campaigns, creators, budgets..."
              className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <Button
              onClick={handleSendChat}
              disabled={!chatInput.trim() || chatMutation.isPending}
            >
              Send
            </Button>
          </div>

          {chatMutation.error && (
            <div className="mt-2 text-sm text-red-600">
              {chatMutation.error.message}
            </div>
          )}
        </Card>
      </div>
    </AppLayout>
  );
}
