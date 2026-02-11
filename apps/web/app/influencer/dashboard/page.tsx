import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export default async function InfluencerDashboard() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect('/login');
  }

  // Fetch ALL active campaigns (Marketplace view)
  const { data: campaigns } = await supabase
    .from('campaigns')
    .select('*, brand:profiles(full_name, avatar_url)')
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  return (
    <div className="flex-1 w-full flex flex-col items-center bg-gray-50 min-h-screen">
      <div className="w-full max-w-6xl p-8">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
            Find Sponsorships
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            Apply to campaigns that match your vibe.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {campaigns && campaigns.map((campaign) => (
            <div key={campaign.id} className="bg-white rounded-xl shadow-sm hover:shadow-lg transition duration-300 overflow-hidden border border-gray-100 flex flex-col">
              <div className="p-6 flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-green-400 to-blue-500 flex items-center justify-center text-white font-bold text-sm">
                    {campaign.brand?.full_name?.[0] || 'B'}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{campaign.brand?.full_name || 'Brand'}</p>
                    <p className="text-xs text-gray-500">Posted recently</p>
                  </div>
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-2">{campaign.title}</h3>
                <p className="text-gray-600 text-sm line-clamp-3 mb-4">{campaign.description}</p>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="bg-green-50 text-green-700 text-xs px-2 py-1 rounded-full font-medium">
                    ${campaign.budget} Budget
                  </span>
                  <span className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-full font-medium">
                    {new Date(campaign.end_date).toLocaleDateString()} Deadline
                  </span>
                </div>
              </div>
              
              <div className="p-4 bg-gray-50 border-t border-gray-100">
                <a 
                  href={`/influencer/campaigns/${campaign.id}`}
                  className="block w-full text-center bg-black text-white py-2 rounded-lg font-semibold hover:bg-gray-800 transition"
                >
                  View Details & Apply
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
