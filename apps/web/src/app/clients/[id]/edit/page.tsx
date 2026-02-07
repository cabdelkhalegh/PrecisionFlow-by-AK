'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AppLayout from '@/components/layout/AppLayout';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { trpc } from '@/lib/trpc';
import { useToast } from '@/components/ui/Toast';

export default function EditClientPage() {
  const params = useParams();
  const router = useRouter();
  const clientId = params?.id as string;
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    website: '',
    address: '',
    industry: '',
    tier: 'bronze' as 'bronze' | 'silver' | 'gold' | 'platinum',
  });

  const { data: client, isLoading } = trpc.clients.getById.useQuery(
    { id: clientId },
    { enabled: !!clientId }
  );

  const updateMutation = trpc.clients.update.useMutation({
    onSuccess: () => {
      showToast('Client updated successfully!', 'success');
      router.push(`/clients/${clientId}`);
    },
    onError: (error) => {
      showToast('Failed to update client', 'error');
      console.error('Update error:', error);
    },
  });

  useEffect(() => {
    if (client) {
      setFormData({
        name: client.name || '',
        company: client.company || '',
        email: client.email || '',
        phone: client.phone || '',
        website: client.website || '',
        address: client.address || '',
        industry: client.industry || '',
        tier: client.tier || 'bronze',
      });
    }
  }, [client]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate({
      id: clientId,
      ...formData,
    });
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-gray-500">Loading client...</div>
        </div>
      </AppLayout>
    );
  }

  if (!client) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Client not found</h2>
            <Button onClick={() => router.push('/clients')}>Back to Clients</Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Edit Client</h1>
          <p className="text-gray-500">Update client information</p>
        </div>

        <form onSubmit={handleSubmit}>
          <Card className="mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Contact Information</h2>
            <div className="space-y-4">
              <Input
                label="Client Name"
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                required
              />
              <Input
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                required
              />
              <Input
                label="Phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
              />
            </div>
          </Card>

          <Card className="mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Company Details</h2>
            <div className="space-y-4">
              <Input
                label="Company Name"
                type="text"
                value={formData.company}
                onChange={(e) => handleChange('company', e.target.value)}
                required
              />
              <Input
                label="Industry"
                type="text"
                value={formData.industry}
                onChange={(e) => handleChange('industry', e.target.value)}
                placeholder="e.g., Technology, Fashion, Food & Beverage"
              />
              <Input
                label="Website"
                type="url"
                value={formData.website}
                onChange={(e) => handleChange('website', e.target.value)}
                placeholder="https://example.com"
              />
              <Input
                label="Address"
                type="text"
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
                placeholder="Full address"
              />
              <Select
                label="Client Tier"
                value={formData.tier}
                onChange={(e) => handleChange('tier', e.target.value)}
              >
                <option value="bronze">Bronze</option>
                <option value="silver">Silver</option>
                <option value="gold">Gold</option>
                <option value="platinum">Platinum</option>
              </Select>
            </div>
          </Card>

          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="secondary"
              onClick={() => router.push(`/clients/${clientId}`)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={updateMutation.isLoading}>
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
