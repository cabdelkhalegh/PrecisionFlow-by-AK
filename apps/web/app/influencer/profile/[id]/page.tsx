import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export default async function InfluencerProfile({ params }: { params: { id: string } }) {
  const supabase = createClient();

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', params.id)
    .single();

  if (error || !profile) {
    return <div>Influencer not found</div>;
  }

  return (
    <div className="flex-1 w-full bg-gray-50 min-h-screen p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
        <div className="h-32 bg-gradient-to-r from-purple-500 to-pink-500"></div>
        <div className="px-8 pb-8">
          <div className="relative flex justify-between items-end -mt-12 mb-6">
            <div className="h-24 w-24 rounded-full border-4 border-white bg-gray-200 overflow-hidden">
              <img src={profile.avatar_url || '/default-avatar.png'} alt={profile.full_name} className="h-full w-full object-cover" />
            </div>
            <div className="flex gap-3">
              <button className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-50">
                Instagram
              </button>
              <button className="bg-black text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-800">
                Hire Now
              </button>
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900">{profile.full_name}</h1>
          <p className="text-gray-500 mb-4">{profile.location || 'Global'}</p>
          
          <div className="flex gap-2 mb-6">
            {profile.niche && profile.niche.map((tag: string) => (
              <span key={tag} className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm">
                {tag}
              </span>
            ))}
          </div>
          
          <p className="text-gray-700 leading-relaxed mb-8 max-w-2xl">
            {profile.bio || "This influencer hasn't written a bio yet."}
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border-t pt-8">
            <div>
              <p className="text-sm text-gray-500 uppercase font-semibold mb-1">Rates</p>
              <ul className="space-y-2">
                <li className="flex justify-between">
                  <span>Post</span>
                  <span className="font-bold">${profile.rates?.post || '-'}</span>
                </li>
                <li className="flex justify-between">
                  <span>Story</span>
                  <span className="font-bold">${profile.rates?.story || '-'}</span>
                </li>
              </ul>
            </div>
            
            <div>
              <p className="text-sm text-gray-500 uppercase font-semibold mb-1">Reach</p>
              <p className="text-2xl font-bold">125k</p>
              <p className="text-xs text-green-600">+12% this month</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-500 uppercase font-semibold mb-1">Engagement</p>
              <p className="text-2xl font-bold">4.8%</p>
              <p className="text-xs text-gray-400">Above average</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
