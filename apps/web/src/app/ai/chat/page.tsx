'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { trpc } from '@/lib/trpc';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
  suggestedActions?: Array<{ action: string; link?: string; priority?: string }>;
  followUpQuestions?: string[];
  confidence?: string;
  dataReferenced?: string[];
};

const exampleQuestions = [
  'How are my campaigns performing overall?',
  'Which campaigns are at risk right now?',
  'What is my total budget utilization?',
  'Who are my top-performing creators?',
  'How many approvals are pending?',
  'Give me a summary of all active campaigns',
  'Which clients have the most campaigns?',
  'What should I focus on this week?',
];

export default function AIChatPage() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const chatMutation = trpc.ai.chat.useMutation({
    onSuccess: (data) => {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: data.answer,
          suggestedActions: data.suggested_actions,
          followUpQuestions: data.follow_up_questions,
          confidence: data.confidence,
          dataReferenced: data.data_referenced,
        },
      ]);
    },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, chatMutation.isPending]);

  const handleSend = (text?: string) => {
    const message = (text || input).trim();
    if (!message || chatMutation.isPending) return;

    setMessages((prev) => [...prev, { role: 'user', content: message }]);
    setInput('');

    const history = messages.map((m) => ({ role: m.role, content: m.content }));
    chatMutation.mutate({ message, history });
  };

  const handleClear = () => {
    setMessages([]);
  };

  return (
    <AppLayout>
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/ai"
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
          >
            &larr; Back to AI Hub
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                🤖 AI Campaign Assistant
              </h1>
              <p className="mt-1 text-gray-500">
                Ask anything about your campaigns, clients, creators, budgets, or performance
              </p>
            </div>
            {messages.length > 0 && (
              <Button variant="secondary" onClick={handleClear}>
                Clear Chat
              </Button>
            )}
          </div>
        </div>

        {/* Chat Container */}
        <Card className="flex flex-col" style={{ minHeight: '60vh' }}>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ maxHeight: '60vh' }}>
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="text-5xl mb-4">🤖</div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  PrecisionFlow AI Assistant
                </h2>
                <p className="text-sm text-gray-500 max-w-md mb-6">
                  I have access to all your campaign data, client information, creator profiles,
                  and financial summaries. Ask me anything!
                </p>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 max-w-lg">
                  {exampleQuestions.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => handleSend(q)}
                      className="text-left rounded-lg border border-gray-200 p-3 text-sm text-gray-700 hover:bg-blue-50 hover:border-blue-300 transition-colors"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-4 ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  {msg.role === 'assistant' && (
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm">🤖</span>
                      <span className="text-xs font-medium text-gray-500">AI Assistant</span>
                      {msg.confidence && (
                        <span className={`text-xs px-1.5 py-0.5 rounded ${
                          msg.confidence === 'high'
                            ? 'bg-green-100 text-green-700'
                            : msg.confidence === 'medium'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-red-100 text-red-700'
                        }`}>
                          {msg.confidence} confidence
                        </span>
                      )}
                    </div>
                  )}

                  <div className="text-sm whitespace-pre-wrap">{msg.content}</div>

                  {/* Data Referenced */}
                  {msg.dataReferenced && msg.dataReferenced.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {msg.dataReferenced.map((d, j) => (
                        <span
                          key={j}
                          className="inline-flex items-center rounded-full bg-gray-200 px-2 py-0.5 text-xs text-gray-600"
                        >
                          {d}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Actions */}
                  {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
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
                            <span className="inline-flex items-center rounded-full bg-white/20 px-3 py-1 text-xs font-medium">
                              {action.action}
                            </span>
                          )}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Follow-up Questions */}
                  {msg.followUpQuestions && msg.followUpQuestions.length > 0 && (
                    <div className="mt-3 border-t border-gray-200 pt-2">
                      <div className="text-xs text-gray-500 mb-1">Follow-up questions:</div>
                      <div className="flex flex-wrap gap-1">
                        {msg.followUpQuestions.map((q, j) => (
                          <button
                            key={j}
                            onClick={() => handleSend(q)}
                            className="text-xs text-blue-600 hover:text-blue-800 bg-blue-50 rounded-full px-2 py-1 hover:bg-blue-100"
                          >
                            {q}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {chatMutation.isPending && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-lg p-4 max-w-[80%]">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm">🤖</span>
                    <span className="text-xs font-medium text-gray-500">AI Assistant</span>
                  </div>
                  <div className="flex gap-1">
                    <span className="inline-block h-2 w-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="inline-block h-2 w-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="inline-block h-2 w-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-gray-200 p-4">
            {chatMutation.error && (
              <div className="mb-2 text-sm text-red-600">{chatMutation.error.message}</div>
            )}
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                placeholder="Ask about campaigns, creators, budgets, performance..."
                className="flex-1 rounded-md border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                disabled={chatMutation.isPending}
              />
              <Button
                onClick={() => handleSend()}
                disabled={!input.trim() || chatMutation.isPending}
              >
                {chatMutation.isPending ? '...' : 'Send'}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}
