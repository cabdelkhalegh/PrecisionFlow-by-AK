'use client';

import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function NewCampaign() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const budget = parseFloat(formData.get('budget') as string);
    const startDate = formData.get('start_date') as string;
    const endDate = formData.get('end_date') as string;

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      alert('You must be logged in');
      return;
    }

    const { error } = await supabase.from('campaigns').insert({
      brand_id: user.id,
      title,
      description,
      budget,
      start_date: startDate,
      end_date: endDate,
      status: 'active',
    });

    setLoading(false);

    if (error) {
      alert('Error creating campaign: ' + error.message);
    } else {
      router.push('/dashboard');
      router.refresh();
    }
  };

  return (
    <div className="flex-1 w-full flex flex-col items-center p-6">
      <div className="w-full max-w-2xl bg-white p-8 rounded shadow">
        <h1 className="text-2xl font-bold mb-6">Create New Campaign</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Campaign Title</label>
            <input name="title" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm p-2 border" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea name="description" rows={3} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm p-2 border"></textarea>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Budget ($)</label>
              <input name="budget" type="number" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm p-2 border" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <select name="status" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm p-2 border">
                <option value="draft">Draft</option>
                <option value="active">Active</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Start Date</label>
              <input name="start_date" type="date" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm p-2 border" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">End Date</label>
              <input name="end_date" type="date" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm p-2 border" />
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Launch Campaign'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
