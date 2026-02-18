'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { trpc } from '@/lib/trpc';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';

export default function NewClientPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    companyName: '',
    email: '',
    phone: '',
    industry: '',
    website: '',
    tier: 'bronze',
  });

  const createClient = trpc.clients.create.useMutation({
    onSuccess: () => {
      router.push('/clients');
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    createClient.mutate(formData);
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <AppLayout>
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Add New Client</h1>
          <p className="mt-2 text-sm text-gray-600">
            Create a new client profile to start managing campaigns
          </p>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Contact Information */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h2>
              <div className="space-y-4">
                <Input
                  label="Contact Name"
                  required
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="John Smith"
                />

                <Input
                  label="Company Name"
                  value={formData.companyName}
                  onChange={(e) => handleChange('companyName', e.target.value)}
                  placeholder="Acme Corporation"
                />

                <Input
                  label="Email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="john@acme.com"
                />

                <Input
                  label="Phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
            </div>

            {/* Company Details */}
            <div className="border-t border-gray-200 pt-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Company Details</h2>
              <div className="space-y-4">
                <Input
                  label="Industry"
                  value={formData.industry}
                  onChange={(e) => handleChange('industry', e.target.value)}
                  placeholder="Technology, Fashion, Food & Beverage, etc."
                />

                <Input
                  label="Website"
                  type="url"
                  value={formData.website}
                  onChange={(e) => handleChange('website', e.target.value)}
                  placeholder="https://www.acme.com"
                />

                <Select
                  label="Client Tier"
                  required
                  options={[
                    { value: 'bronze', label: 'Bronze' },
                    { value: 'silver', label: 'Silver' },
                    { value: 'gold', label: 'Gold' },
                    { value: 'platinum', label: 'Platinum' },
                  ]}
                  value={formData.tier}
                  onChange={(e) => handleChange('tier', e.target.value)}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-4 border-t border-gray-200 pt-6">
              <Button
                type="button"
                variant="secondary"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
              <Button type="submit" loading={createClient.isPending}>
                Create Client
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </AppLayout>
  );
}
