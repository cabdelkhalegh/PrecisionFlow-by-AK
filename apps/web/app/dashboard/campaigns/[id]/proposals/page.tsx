import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export default async function CampaignProposals({ params }: { params: { id: string } }) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect('/login');
  }

  // Fetch Proposals for this Campaign
  const { data: proposals } = await supabase
    .from('proposals')
    .select('*, influencer:profiles(id, full_name, avatar_url, bio)')
    .eq('campaign_id', params.id)
    .order('created_at', { ascending: false });

  const { data: campaign } = await supabase
    .from('campaigns')
    .select('title')
    .eq('id', params.id)
    .single();

  return (
    <div className="flex-1 w-full flex flex-col items-center bg-gray-50 min-h-screen">
      <div className="w-full max-w-5xl p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Proposals for: {campaign?.title}
          </h1>
          <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
            {proposals?.length || 0} Applications
          </span>
        </div>

        <div className="space-y-6">
          {proposals && proposals.length > 0 ? (
            proposals.map((prop) => (
              <div key={prop.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex flex-col md:flex-row gap-6">
                <div className="flex items-start gap-4 flex-1">
                  <div className="h-16 w-16 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                    <img 
                      src={prop.influencer?.avatar_url || '/default-avatar.png'} 
                      alt={prop.influencer?.full_name} 
                      className="h-full w-full object-cover" 
                    />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{prop.influencer?.full_name}</h3>
                    <p className="text-sm text-gray-500 mb-2">{prop.influencer?.bio?.substring(0, 100)}...</p>
                    <div className="bg-gray-50 p-3 rounded text-gray-700 italic border-l-4 border-green-500">
                      &quot;{prop.pitch}&quot;
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2 min-w-[150px]">
                  <p className="text-2xl font-bold text-gray-900">${prop.proposed_rate}</p>
                  <p className="text-xs text-gray-500 mb-4">Proposed Rate</p>
                  
                  <div className="flex gap-2 w-full">
                    <button className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded shadow-sm">
                      Accept
                    </button>
                    <button className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 font-bold py-2 px-4 rounded border border-red-200">
                      Reject
                    </button>
                  </div>
                  <a href={`/influencer/profile/${prop.influencer?.id}`} className="text-sm text-blue-600 hover:underline mt-2">
                    View Full Profile
                  </a>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-20 bg-white rounded-lg border border-dashed border-gray-300">
              <p className="text-xl text-gray-400">No applications yet.</p>
              <p className="text-gray-500 mt-2">Share your campaign link to get proposals.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
