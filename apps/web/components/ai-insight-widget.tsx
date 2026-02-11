'use client';

import { createClient } from '@/utils/supabase/client';
import { useState } from 'react';

export default function AIInsightWidget({ campaignId }: { campaignId: string }) {
  const [insight, setInsight] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const generateInsight = async () => {
    setLoading(true);
    // In a real app, this calls an API route that uses OpenAI
    // For MVP, we simulate the "Flagship" thinking
    setTimeout(() => {
      setInsight("Based on current trends, this campaign needs 3 micro-influencers in the 'Tech/Desk Setup' niche to maximize ROI. Suggested budget allocation: 60% Reels, 40% Stories.");
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-4 rounded-lg border border-blue-100 mt-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-semibold text-indigo-900 flex items-center gap-2">
          ✨ TiKiT Intelligence
        </h3>
        <button 
          onClick={generateInsight}
          disabled={loading || insight !== null}
          className="text-xs bg-indigo-600 text-white px-2 py-1 rounded hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? 'Analyzing...' : 'Generate Strategy'}
        </button>
      </div>
      
      {insight ? (
        <p className="text-sm text-indigo-800 animate-fade-in">{insight}</p>
      ) : (
        <p className="text-xs text-indigo-400">Click to run AI prediction model on this campaign.</p>
      )}
    </div>
  );
}
