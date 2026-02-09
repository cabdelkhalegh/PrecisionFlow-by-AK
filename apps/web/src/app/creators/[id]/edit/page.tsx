'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { trpc } from '@/lib/trpc';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function CreatorEditPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: creator, isLoading } = trpc.creators.getById.useQuery({ id });

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [primaryPlatform, setPrimaryPlatform] = useState('');
  const [status, setStatus] = useState('active');

  // Social handles
  const [instagramHandle, setInstagramHandle] = useState('');
  const [tiktokHandle, setTiktokHandle] = useState('');
  const [youtubeHandle, setYoutubeHandle] = useState('');
  const [twitterHandle, setTwitterHandle] = useState('');

  // Stats
  const [instagramFollowers, setInstagramFollowers] = useState('');
  const [tiktokFollowers, setTiktokFollowers] = useState('');
  const [youtubeSubscribers, setYoutubeSubscribers] = useState('');
  const [twitterFollowers, setTwitterFollowers] = useState('');
  const [avgEngagement, setAvgEngagement] = useState('');

  // Location
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [notes, setNotes] = useState('');

  // Populate form when data loads
  useEffect(() => {
    if (creator) {
      setName(creator.name || '');
      setEmail(creator.email || '');
      setPhone(creator.phone || '');
      setBio(creator.bio || '');
      setPrimaryPlatform(creator.primary_platform || '');
      setStatus(creator.status || 'active');
      setInstagramHandle(creator.instagram_handle || '');
      setTiktokHandle(creator.tiktok_handle || '');
      setYoutubeHandle(creator.youtube_handle || '');
      setTwitterHandle(creator.twitter_handle || '');
      setInstagramFollowers(creator.instagram_followers?.toString() || '');
      setTiktokFollowers(creator.tiktok_followers?.toString() || '');
      setYoutubeSubscribers(creator.youtube_subscribers?.toString() || '');
      setTwitterFollowers(creator.twitter_followers?.toString() || '');
      setAvgEngagement(creator.avg_engagement_rate?.toString() || '');
      setCountry(creator.country || '');
      setCity(creator.city || '');
      setNotes(creator.notes || '');
    }
  }, [creator]);

  const updateMutation = trpc.creators.update.useMutation({
    onSuccess: () => {
      router.push(`/creators/${id}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const data: Record<string, unknown> = { name };

    // Only include non-empty values
    if (email) data.email = email;
    if (phone) data.phone = phone;
    if (bio) data.bio = bio;
    if (primaryPlatform) data.primary_platform = primaryPlatform;
    if (status) data.status = status;
    if (instagramHandle) data.instagram_handle = instagramHandle;
    if (tiktokHandle) data.tiktok_handle = tiktokHandle;
    if (youtubeHandle) data.youtube_handle = youtubeHandle;
    if (twitterHandle) data.twitter_handle = twitterHandle;
    if (instagramFollowers) data.instagram_followers = parseInt(instagramFollowers, 10);
    if (tiktokFollowers) data.tiktok_followers = parseInt(tiktokFollowers, 10);
    if (youtubeSubscribers) data.youtube_subscribers = parseInt(youtubeSubscribers, 10);
    if (twitterFollowers) data.twitter_followers = parseInt(twitterFollowers, 10);
    if (avgEngagement) data.avg_engagement_rate = parseFloat(avgEngagement);
    if (country) data.country = country;
    if (city) data.city = city;
    if (notes) data.notes = notes;

    updateMutation.mutate({ id, data });
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="text-gray-500">Loading creator…</div>
        </div>
      </AppLayout>
    );
  }

  if (!creator) {
    return (
      <AppLayout>
        <div className="mx-auto max-w-3xl px-4 py-16 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Creator not found</h2>
          <Link href="/creators"><Button>Back to Creators</Button></Link>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <Link href={`/creators/${id}`} className="mb-6 inline-flex items-center text-sm text-gray-500 hover:text-gray-700">
          ← Back to Profile
        </Link>

        <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Creator: {creator.name}</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} required
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                <textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} rows={3}
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
              </div>
              <div>
                <label htmlFor="primaryPlatform" className="block text-sm font-medium text-gray-700 mb-1">Primary Platform</label>
                <select id="primaryPlatform" value={primaryPlatform} onChange={(e) => setPrimaryPlatform(e.target.value)}
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500">
                  <option value="">Select…</option>
                  <option value="instagram">Instagram</option>
                  <option value="tiktok">TikTok</option>
                  <option value="youtube">YouTube</option>
                  <option value="twitter">Twitter</option>
                  <option value="facebook">Facebook</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select id="status" value={status} onChange={(e) => setStatus(e.target.value)}
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="blacklisted">Blacklisted</option>
                </select>
              </div>
            </div>
          </Card>

          {/* Social Handles & Stats */}
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Social Platforms</h2>
            <div className="space-y-4">
              {[
                { label: 'Instagram', icon: '📸', handle: instagramHandle, setHandle: setInstagramHandle, followers: instagramFollowers, setFollowers: setInstagramFollowers },
                { label: 'TikTok', icon: '🎵', handle: tiktokHandle, setHandle: setTiktokHandle, followers: tiktokFollowers, setFollowers: setTiktokFollowers },
                { label: 'YouTube', icon: '🎬', handle: youtubeHandle, setHandle: setYoutubeHandle, followers: youtubeSubscribers, setFollowers: setYoutubeSubscribers },
                { label: 'Twitter', icon: '🐦', handle: twitterHandle, setHandle: setTwitterHandle, followers: twitterFollowers, setFollowers: setTwitterFollowers },
              ].map((platform) => (
                <div key={platform.label} className="grid grid-cols-3 gap-3 items-end">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {platform.icon} {platform.label} Handle
                    </label>
                    <input type="text" value={platform.handle} onChange={(e) => platform.setHandle(e.target.value)}
                      placeholder={`@${platform.label.toLowerCase()}`}
                      className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Followers</label>
                    <input type="number" value={platform.followers} onChange={(e) => platform.setFollowers(e.target.value)}
                      min="0" placeholder="0"
                      className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
                  </div>
                </div>
              ))}
              <div className="pt-2">
                <label htmlFor="avgEngagement" className="block text-sm font-medium text-gray-700 mb-1">
                  Average Engagement Rate (%)
                </label>
                <input id="avgEngagement" type="number" step="0.01" min="0" max="100"
                  value={avgEngagement} onChange={(e) => setAvgEngagement(e.target.value)}
                  className="block w-full max-w-[200px] rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
              </div>
            </div>
          </Card>

          {/* Location & Notes */}
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Location & Notes</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                <input id="country" type="text" value={country} onChange={(e) => setCountry(e.target.value)}
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
              </div>
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input id="city" type="text" value={city} onChange={(e) => setCity(e.target.value)}
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={3}
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
              </div>
            </div>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Link href={`/creators/${id}`}>
              <Button variant="secondary">Cancel</Button>
            </Link>
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? 'Saving…' : 'Save Changes'}
            </Button>
          </div>

          {updateMutation.error && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
              ❌ {updateMutation.error.message}
            </div>
          )}
        </form>
      </div>
    </AppLayout>
  );
}
