'use client';

import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { useToast } from '@/components/ui/Toast';

interface NotificationSetting {
  key: string;
  label: string;
  description: string;
  enabled: boolean;
}

export default function SettingsPage() {
  const { showToast } = useToast();

  // Profile form
  const [profile, setProfile] = useState({
    fullName: 'Campaign Manager',
    email: 'cm@tikit.agency',
    role: 'Campaign Manager',
    timezone: 'America/New_York',
    language: 'en',
  });

  // Notification preferences
  const [notifications, setNotifications] = useState<NotificationSetting[]>([
    { key: 'approval_assigned', label: 'Approval Assigned', description: 'When an approval is assigned to you', enabled: true },
    { key: 'approval_decided', label: 'Approval Decided', description: 'When your approval request is approved or rejected', enabled: true },
    { key: 'brief_processed', label: 'Brief Processed', description: 'When AI finishes processing a brief', enabled: true },
    { key: 'campaign_status', label: 'Campaign Status Changes', description: 'When a campaign status changes', enabled: false },
    { key: 'content_submitted', label: 'Content Submitted', description: 'When a creator submits content for review', enabled: true },
    { key: 'deadline_reminder', label: 'Deadline Reminders', description: '24h reminder before content deadlines', enabled: true },
  ]);

  // Display preferences
  const [display, setDisplay] = useState({
    defaultDashboardView: 'cards',
    campaignsPerPage: '20',
    dateFormat: 'MM/DD/YYYY',
    currency: 'USD',
  });

  const handleProfileChange = (field: string, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const toggleNotification = (key: string) => {
    setNotifications(prev =>
      prev.map(n => n.key === key ? { ...n, enabled: !n.enabled } : n)
    );
  };

  const handleDisplayChange = (field: string, value: string) => {
    setDisplay(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveProfile = () => {
    showToast('Profile settings saved', 'success');
  };

  const handleSaveNotifications = () => {
    showToast('Notification preferences saved', 'success');
  };

  const handleSaveDisplay = () => {
    showToast('Display preferences saved', 'success');
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="mt-2 text-gray-600">Manage your account and application preferences</p>
        </div>

        {/* Profile Settings */}
        <Card>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Profile</h2>
                <p className="text-sm text-gray-500">Your personal information</p>
              </div>
              <div className="h-16 w-16 rounded-full bg-blue-500 flex items-center justify-center text-white text-2xl font-bold">
                {profile.fullName.split(' ').filter(Boolean).map(n => n[0]).join('').toUpperCase()}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                value={profile.fullName}
                onChange={(e) => handleProfileChange('fullName', e.target.value)}
              />
              <Input
                label="Email"
                type="email"
                value={profile.email}
                onChange={(e) => handleProfileChange('email', e.target.value)}
              />
              <Select
                label="Role"
                value={profile.role}
                onChange={(e) => handleProfileChange('role', e.target.value)}
                disabled
              >
                <option value="Campaign Manager">Campaign Manager</option>
                <option value="Director">Director</option>
                <option value="Finance">Finance</option>
                <option value="Admin">Admin</option>
              </Select>
              <Select
                label="Timezone"
                value={profile.timezone}
                onChange={(e) => handleProfileChange('timezone', e.target.value)}
              >
                <option value="America/New_York">Eastern (UTC-5)</option>
                <option value="America/Chicago">Central (UTC-6)</option>
                <option value="America/Denver">Mountain (UTC-7)</option>
                <option value="America/Los_Angeles">Pacific (UTC-8)</option>
                <option value="Europe/London">London (UTC+0)</option>
                <option value="Europe/Paris">Paris (UTC+1)</option>
                <option value="Asia/Dubai">Dubai (UTC+4)</option>
                <option value="Asia/Tokyo">Tokyo (UTC+9)</option>
              </Select>
            </div>

            <div className="flex justify-end pt-4 border-t">
              <Button variant="primary" onClick={handleSaveProfile}>
                Save Profile
              </Button>
            </div>
          </div>
        </Card>

        {/* Notification Settings */}
        <Card>
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Notifications</h2>
              <p className="text-sm text-gray-500">Choose what you want to be notified about</p>
            </div>

            <div className="divide-y divide-gray-100">
              {notifications.map((notif) => (
                <div key={notif.key} className="flex items-center justify-between py-4">
                  <div>
                    <p className="font-medium text-gray-900">{notif.label}</p>
                    <p className="text-sm text-gray-500">{notif.description}</p>
                  </div>
                  <button
                    onClick={() => toggleNotification(notif.key)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      notif.enabled ? 'bg-blue-500' : 'bg-gray-300'
                    }`}
                    role="switch"
                    aria-checked={notif.enabled}
                    aria-label={`Toggle ${notif.label}`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        notif.enabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-4 border-t">
              <Button variant="primary" onClick={handleSaveNotifications}>
                Save Notifications
              </Button>
            </div>
          </div>
        </Card>

        {/* Display Preferences */}
        <Card>
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Display</h2>
              <p className="text-sm text-gray-500">Customize how information is displayed</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Default Dashboard View"
                value={display.defaultDashboardView}
                onChange={(e) => handleDisplayChange('defaultDashboardView', e.target.value)}
              >
                <option value="cards">Cards</option>
                <option value="table">Table</option>
                <option value="compact">Compact</option>
              </Select>
              <Select
                label="Items Per Page"
                value={display.campaignsPerPage}
                onChange={(e) => handleDisplayChange('campaignsPerPage', e.target.value)}
              >
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </Select>
              <Select
                label="Date Format"
                value={display.dateFormat}
                onChange={(e) => handleDisplayChange('dateFormat', e.target.value)}
              >
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              </Select>
              <Select
                label="Currency"
                value={display.currency}
                onChange={(e) => handleDisplayChange('currency', e.target.value)}
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="AED">AED (د.إ)</option>
              </Select>
            </div>

            <div className="flex justify-end pt-4 border-t">
              <Button variant="primary" onClick={handleSaveDisplay}>
                Save Display
              </Button>
            </div>
          </div>
        </Card>

        {/* Danger Zone */}
        <Card>
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold text-red-600">Danger Zone</h2>
              <p className="text-sm text-gray-500">Irreversible actions</p>
            </div>
            <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
              <div>
                <p className="font-medium text-gray-900">Export All Data</p>
                <p className="text-sm text-gray-500">Download all your data as JSON</p>
              </div>
              <Button variant="secondary" onClick={() => showToast('Data export started. You will receive an email when ready.', 'info')}>
                Export
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}
