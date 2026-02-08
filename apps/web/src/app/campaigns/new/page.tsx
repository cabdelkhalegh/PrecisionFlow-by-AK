'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { trpc } from '@/lib/trpc';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';

export default function NewCampaignPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    clientId: '',
    startDate: '',
    endDate: '',
    budgetTotal: '',
    tags: '',
  });

  // Load clients for dropdown
  const { data: clientsData, isLoading: loadingClients } = trpc.clients.list.useQuery({
    limit: 100,
    offset: 0,
  });

  const clients = clientsData?.clients || [];

  const createCampaign = trpc.campaigns.create.useMutation({
    onSuccess: () => {
      router.push('/campaigns');
    },
    onError: (error) => {
      alert('Failed to create campaign: ' + error.message);
      setIsSubmitting(false);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.clientId) {
      alert('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    const tags = formData.tags
      ? formData.tags.split(',').map(tag => tag.trim()).filter(Boolean)
      : [];

    createCampaign.mutate({
      name: formData.name,
      clientId: formData.clientId,
      startDate: formData.startDate || undefined,
      endDate: formData.endDate || undefined,
      budgetTotal: formData.budgetTotal ? parseFloat(formData.budgetTotal) : undefined,
      tags,
    });
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create New Campaign</h1>
          <p className="mt-2 text-gray-600">
            Set up a new influencer marketing campaign
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <Card>
            <div className="space-y-6">
              {/* Campaign Details Section */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Campaign Details
                </h2>
                <div className="space-y-4">
                  <Input
                    label="Campaign Name *"
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    placeholder="e.g., Summer Product Launch 2026"
                    required
                  />

                  <Select
                    label="Client *"
                    value={formData.clientId}
                    onChange={(e) => handleChange('clientId', e.target.value)}
                    required
                    disabled={loadingClients}
                  >
                    <option value="">
                      {loadingClients ? 'Loading clients...' : 'Select a client'}
                    </option>
                    {clients.map((client: any) => (
                      <option key={client.id} value={client.id}>
                        {client.name} ({client.company})
                      </option>
                    ))}
                  </Select>
                </div>
              </div>

              {/* Timeline Section */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Timeline
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Start Date"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => handleChange('startDate', e.target.value)}
                  />
                  <Input
                    label="End Date"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => handleChange('endDate', e.target.value)}
                  />
                </div>
              </div>

              {/* Budget Section */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Budget
                </h2>
                <Input
                  label="Total Budget (USD)"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.budgetTotal}
                  onChange={(e) => handleChange('budgetTotal', e.target.value)}
                  placeholder="e.g., 50000"
                />
              </div>

              {/* Tags Section */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Tags
                </h2>
                <Input
                  label="Tags (comma-separated)"
                  type="text"
                  value={formData.tags}
                  onChange={(e) => handleChange('tags', e.target.value)}
                  placeholder="e.g., beauty, skincare, Instagram"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Separate tags with commas
                </p>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-4 pt-4 border-t">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => router.push('/campaigns')}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  loading={isSubmitting}
                >
                  Create Campaign
                </Button>
              </div>
            </div>
          </Card>
        </form>
      </div>
    </AppLayout>
  );
}
