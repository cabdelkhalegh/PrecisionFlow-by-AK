'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { trpc } from '@/lib/trpc';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';

export default function NewCreatorPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    bio: '',
    primary_platform: 'instagram' as const,
    instagram_handle: '',
    tiktok_handle: '',
    youtube_handle: '',
    twitter_handle: '',
    instagram_followers: '',
    tiktok_followers: '',
    youtube_subscribers: '',
    twitter_followers: '',
    avg_engagement_rate: '',
    country: '',
    city: '',
    niche: '',
    content_types: '',
    notes: '',
  });

  const createCreator = trpc.creators.create.useMutation({
    onSuccess: () => {
      router.push('/creators');
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    createCreator.mutate({
      name: formData.name,
      email: formData.email || undefined,
      phone: formData.phone || undefined,
      bio: formData.bio || undefined,
      primary_platform: formData.primary_platform,
      instagram_handle: formData.instagram_handle || undefined,
      tiktok_handle: formData.tiktok_handle || undefined,
      youtube_handle: formData.youtube_handle || undefined,
      twitter_handle: formData.twitter_handle || undefined,
      instagram_followers: formData.instagram_followers ? parseInt(formData.instagram_followers, 10) : undefined,
      tiktok_followers: formData.tiktok_followers ? parseInt(formData.tiktok_followers, 10) : undefined,
      youtube_subscribers: formData.youtube_subscribers ? parseInt(formData.youtube_subscribers, 10) : undefined,
      twitter_followers: formData.twitter_followers ? parseInt(formData.twitter_followers, 10) : undefined,
      avg_engagement_rate: formData.avg_engagement_rate ? parseFloat(formData.avg_engagement_rate) : undefined,
      country: formData.country || undefined,
      city: formData.city || undefined,
      niche: formData.niche ? formData.niche.split(',').map((s) => s.trim()).filter(Boolean) : undefined,
      content_types: formData.content_types ? formData.content_types.split(',').map((s) => s.trim()).filter(Boolean) : undefined,
      notes: formData.notes || undefined,
    });
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <AppLayout>
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Add Creator</h1>
          <p className="mt-2 text-sm text-gray-600">
            Add a new influencer or content creator to the database
          </p>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
              <div className="space-y-4">
                <Input
                  label="Creator Name"
                  required
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="Sarah Fitness"
                />
                <Input
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="creator@example.com"
                />
                <Input
                  label="Phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder="+1 (555) 123-4567"
                />
                <Textarea
                  label="Bio"
                  value={formData.bio}
                  onChange={(e) => handleChange('bio', e.target.value)}
                  placeholder="Brief description of the creator..."
                  rows={3}
                />
              </div>
            </div>

            {/* Social Handles */}
            <div className="border-t border-gray-200 pt-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Social Media</h2>
              <div className="space-y-4">
                <Select
                  label="Primary Platform"
                  required
                  options={[
                    { value: 'instagram', label: 'Instagram' },
                    { value: 'tiktok', label: 'TikTok' },
                    { value: 'youtube', label: 'YouTube' },
                    { value: 'twitter', label: 'Twitter' },
                    { value: 'facebook', label: 'Facebook' },
                    { value: 'other', label: 'Other' },
                  ]}
                  value={formData.primary_platform}
                  onChange={(e) => handleChange('primary_platform', e.target.value)}
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Instagram Handle"
                    value={formData.instagram_handle}
                    onChange={(e) => handleChange('instagram_handle', e.target.value)}
                    placeholder="@username"
                  />
                  <Input
                    label="Instagram Followers"
                    type="number"
                    value={formData.instagram_followers}
                    onChange={(e) => handleChange('instagram_followers', e.target.value)}
                    placeholder="100000"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="TikTok Handle"
                    value={formData.tiktok_handle}
                    onChange={(e) => handleChange('tiktok_handle', e.target.value)}
                    placeholder="@username"
                  />
                  <Input
                    label="TikTok Followers"
                    type="number"
                    value={formData.tiktok_followers}
                    onChange={(e) => handleChange('tiktok_followers', e.target.value)}
                    placeholder="100000"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="YouTube Handle"
                    value={formData.youtube_handle}
                    onChange={(e) => handleChange('youtube_handle', e.target.value)}
                    placeholder="ChannelName"
                  />
                  <Input
                    label="YouTube Subscribers"
                    type="number"
                    value={formData.youtube_subscribers}
                    onChange={(e) => handleChange('youtube_subscribers', e.target.value)}
                    placeholder="100000"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Twitter Handle"
                    value={formData.twitter_handle}
                    onChange={(e) => handleChange('twitter_handle', e.target.value)}
                    placeholder="@username"
                  />
                  <Input
                    label="Twitter Followers"
                    type="number"
                    value={formData.twitter_followers}
                    onChange={(e) => handleChange('twitter_followers', e.target.value)}
                    placeholder="100000"
                  />
                </div>
              </div>
            </div>

            {/* Engagement & Classification */}
            <div className="border-t border-gray-200 pt-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Classification</h2>
              <div className="space-y-4">
                <Input
                  label="Average Engagement Rate (%)"
                  type="number"
                  value={formData.avg_engagement_rate}
                  onChange={(e) => handleChange('avg_engagement_rate', e.target.value)}
                  placeholder="4.5"
                />
                <Input
                  label="Niche (comma-separated)"
                  value={formData.niche}
                  onChange={(e) => handleChange('niche', e.target.value)}
                  placeholder="fitness, health, lifestyle"
                />
                <Input
                  label="Content Types (comma-separated)"
                  value={formData.content_types}
                  onChange={(e) => handleChange('content_types', e.target.value)}
                  placeholder="reel, story, video, post"
                />
              </div>
            </div>

            {/* Location */}
            <div className="border-t border-gray-200 pt-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Location</h2>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Country"
                  value={formData.country}
                  onChange={(e) => handleChange('country', e.target.value)}
                  placeholder="US"
                />
                <Input
                  label="City"
                  value={formData.city}
                  onChange={(e) => handleChange('city', e.target.value)}
                  placeholder="Los Angeles"
                />
              </div>
            </div>

            {/* Notes */}
            <div className="border-t border-gray-200 pt-6">
              <Textarea
                label="Notes"
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                placeholder="Internal notes about this creator..."
                rows={3}
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-4 border-t border-gray-200 pt-6">
              <Button type="button" variant="secondary" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button type="submit" loading={createCreator.isLoading}>
                Add Creator
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </AppLayout>
  );
}
