'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { trpc } from '@/lib/trpc';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { useToast } from '@/components/ui/Toast';

const CAMPAIGN_STATUSES = [
  { value: 'draft', label: 'Draft' },
  { value: 'internal_approval', label: 'Internal Approval' },
  { value: 'client_review', label: 'Client Review' },
  { value: 'approved', label: 'Approved' },
  { value: 'in_execution', label: 'In Execution' },
  { value: 'completed', label: 'Completed' },
  { value: 'closed', label: 'Closed' },
];

export default function EditCampaignPage() {
  const params = useParams();
  const router = useRouter();
  const campaignId = params?.id as string;
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    status: '',
    startDate: '',
    endDate: '',
    budgetTotal: '',
    tags: '',
  });

  // Load campaign data
  const { data: campaignData, isLoading: campaignLoading } = trpc.campaigns.getById.useQuery(
    { id: campaignId },
    { enabled: !!campaignId }
  );
  const campaign: any = campaignData;

  // Pre-populate form when campaign loads
  useEffect(() => {
    if (campaign) {
      setFormData({
        name: campaign.name || '',
        status: campaign.status || 'draft',
        startDate: campaign.start_date ? campaign.start_date.split('T')[0] : '',
        endDate: campaign.end_date ? campaign.end_date.split('T')[0] : '',
        budgetTotal: campaign.budget_total ? String(campaign.budget_total) : '',
        tags: Array.isArray(campaign.tags) ? campaign.tags.join(', ') : '',
      });
    }
  }, [campaign]);

  const updateCampaign = trpc.campaigns.update.useMutation({
    onSuccess: () => {
      showToast('Campaign updated successfully!', 'success');
      router.push(`/campaigns/${campaignId}`);
    },
    onError: (error) => {
      showToast('Failed to update: ' + error.message, 'error');
      setIsSubmitting(false);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name) {
      showToast('Campaign name is required', 'warning');
      return;
    }

    setIsSubmitting(true);

    const tags = formData.tags
      ? formData.tags.split(',').map(tag => tag.trim()).filter(Boolean)
      : undefined;

    updateCampaign.mutate({
      id: campaignId,
      name: formData.name,
      status: formData.status || undefined,
      startDate: formData.startDate || undefined,
      endDate: formData.endDate || undefined,
      budgetTotal: formData.budgetTotal ? parseFloat(formData.budgetTotal) : undefined,
      tags,
    });
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (campaignLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-gray-500">Loading campaign...</div>
        </div>
      </AppLayout>
    );
  }

  if (!campaign) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Campaign not found</h2>
            <Button onClick={() => router.push('/campaigns')}>Back to Campaigns</Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Campaign</h1>
          <p className="mt-2 text-gray-600">
            Update campaign details for &ldquo;{campaign.name}&rdquo;
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <Card>
            <div className="space-y-6">
              {/* Campaign Details */}
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Select
                      label="Status"
                      value={formData.status}
                      onChange={(e) => handleChange('status', e.target.value)}
                    >
                      {CAMPAIGN_STATUSES.map((s) => (
                        <option key={s.value} value={s.value}>
                          {s.label}
                        </option>
                      ))}
                    </Select>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Client
                      </label>
                      <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-700">
                        {campaign.clients?.name || 'Unknown Client'}
                      </div>
                      <p className="mt-1 text-xs text-gray-400">Client cannot be changed after creation</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Timeline</h2>
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

              {/* Budget */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Budget</h2>
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

              {/* Tags */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Tags</h2>
                <Input
                  label="Tags (comma-separated)"
                  type="text"
                  value={formData.tags}
                  onChange={(e) => handleChange('tags', e.target.value)}
                  placeholder="e.g., beauty, skincare, Instagram"
                />
                <p className="mt-1 text-sm text-gray-500">Separate tags with commas</p>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-4 pt-4 border-t">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => router.push(`/campaigns/${campaignId}`)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  loading={isSubmitting}
                >
                  Save Changes
                </Button>
              </div>
            </div>
          </Card>
        </form>
      </div>
    </AppLayout>
  );
}
