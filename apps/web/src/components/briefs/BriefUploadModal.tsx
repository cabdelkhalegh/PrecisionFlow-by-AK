'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { trpc } from '@/lib/trpc';
import { useToast } from '@/components/ui/Toast';

interface BriefUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaignId: string;
  onSuccess?: () => void;
}

export function BriefUploadModal({
  isOpen,
  onClose,
  campaignId,
  onSuccess,
}: BriefUploadModalProps) {
  const [rawContent, setRawContent] = useState('');
  const [processWithAI, setProcessWithAI] = useState(true);
  const { showToast } = useToast();

  const uploadMutation = trpc.briefs.upload.useMutation();
  const processAIMutation = trpc.briefs.processWithAI.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!rawContent.trim()) {
      showToast('Please enter brief content', 'error');
      return;
    }

    try {
      // Upload the brief
      const brief = await uploadMutation.mutateAsync({
        campaignId,
        rawContent,
      });

      showToast('Brief uploaded successfully!', 'success');

      // Process with AI if enabled
      if (processWithAI && brief.id) {
        try {
          await processAIMutation.mutateAsync({ id: brief.id });
          showToast('Brief processed with AI!', 'success');
        } catch (aiError) {
          console.error('AI processing error:', aiError);
          showToast('Brief uploaded but AI processing failed', 'warning');
        }
      }

      setRawContent('');
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Upload error:', error);
      showToast('Failed to upload brief', 'error');
    }
  };

  const isLoading = uploadMutation.isLoading || processAIMutation.isLoading;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Upload Campaign Brief">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Textarea
          label="Brief Content"
          value={rawContent}
          onChange={(e) => setRawContent(e.target.value)}
          rows={12}
          placeholder="Paste your campaign brief here...

Example:
Campaign: Summer 2024 Product Launch
Objective: Increase brand awareness for new product line
Target Audience: Women aged 25-45 interested in wellness
Deliverables: 10 Instagram posts, 5 TikTok videos
Timeline: June 1 - August 31, 2024
Budget: $50,000
KPIs: 1M impressions, 50K engagements, 5% engagement rate"
          required
        />

        <div className="flex items-center">
          <input
            type="checkbox"
            id="processWithAI"
            checked={processWithAI}
            onChange={(e) => setProcessWithAI(e.target.checked)}
            className="mr-2"
          />
          <label htmlFor="processWithAI" className="text-sm text-gray-700">
            Process with AI (extract structured data and calculate risk)
          </label>
        </div>

        <div className="flex gap-3 justify-end pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={isLoading}>
            Upload Brief
          </Button>
        </div>
      </form>
    </Modal>
  );
}
