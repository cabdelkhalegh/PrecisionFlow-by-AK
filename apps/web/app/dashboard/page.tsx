import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export default async function Dashboard() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect('/login');
  }

  const { data: campaigns } = await supabase
    .from('campaigns')
    .select('*')
    .eq('brand_id', user.id)
    .order('created_at', { ascending: false });

  return (
    <div className="flex-1 w-full flex flex-col gap-20 items-center">
      <div className="w-full max-w-4xl p-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Campaign Dashboard</h1>
          <a
            href="/dashboard/campaigns/new"
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
          >
            + New Campaign
          </a>
        </div>

        {campaigns && campaigns.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns.map((campaign) => (
              <div key={campaign.id} className="border rounded-lg p-6 shadow-sm hover:shadow-md transition">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-xl font-semibold">{campaign.title}</h2>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    campaign.status === 'active' ? 'bg-green-100 text-green-800' :
                    campaign.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {campaign.status.toUpperCase()}
                  </span>
                </div>
                <p className="text-gray-600 mb-4 line-clamp-2">{campaign.description}</p>
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <span>${campaign.budget}</span>
                  <span>{new Date(campaign.start_date).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-gray-50 rounded-lg">
            <p className="text-xl text-gray-600 mb-4">No campaigns found.</p>
            <p className="text-gray-500">Create your first campaign to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
}
