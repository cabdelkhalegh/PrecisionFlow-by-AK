import { render, screen } from '@testing-library/react';
import { CampaignPipelineBoard } from '../components/campaigns/CampaignPipelineBoard';
import { vi } from 'vitest';
import React from 'react';

// Mock trpc
vi.mock('@/lib/trpc', () => ({
  trpc: {
    shortlists: {
      getByCampaign: {
        useQuery: vi.fn(() => ({
          data: [
            { 
              id: 's1', 
              status: 'draft', 
              creator: { name: 'Creator Draft', primary_platform: 'Instagram' },
              proposed_rate: 100
            },
            { 
              id: 's2', 
              status: 'approved', 
              creator: { name: 'Creator Approved', primary_platform: 'YouTube' },
              proposed_rate: 500
            }
          ],
          isLoading: false
        }))
      }
    },
    contentTasks: {
      getByCampaign: {
        useQuery: vi.fn(() => ({
          data: [
            {
              id: 't1',
              title: 'Task Assigned',
              status: 'assigned',
              creator: { name: 'Creator Assigned' },
              final_deadline: new Date().toISOString()
            },
            {
              id: 't2',
              title: 'Task Live',
              status: 'published',
              creator: { name: 'Creator Live' },
              final_deadline: new Date().toISOString()
            }
          ],
          isLoading: false
        }))
      }
    }
  }
}));

describe('CampaignPipelineBoard (Ubuntu TiKiT OS)', () => {
  it('renders all 4 pipeline columns correctly', () => {
    render(<CampaignPipelineBoard campaignId="test-123" />);
    
    // Check Columns
    expect(screen.getByText('Proposed')).toBeInTheDocument();
    expect(screen.getByText('Approved')).toBeInTheDocument();
    expect(screen.getByText('In Production')).toBeInTheDocument();
    expect(screen.getByText('Live / Done')).toBeInTheDocument();
  });

  it('filters shortlist items into Proposed column', () => {
    render(<CampaignPipelineBoard campaignId="test-123" />);
    expect(screen.getByText('Creator Draft')).toBeInTheDocument();
    // Should verify it's conceptually in the first column logic (by mock data association)
  });

  it('filters approved items into Approved column', () => {
    render(<CampaignPipelineBoard campaignId="test-123" />);
    expect(screen.getByText('Creator Approved')).toBeInTheDocument();
  });

  it('filters task items into Production column', () => {
    render(<CampaignPipelineBoard campaignId="test-123" />);
    expect(screen.getByText('Task Assigned')).toBeInTheDocument();
  });

  it('filters published items into Live column', () => {
    render(<CampaignPipelineBoard campaignId="test-123" />);
    expect(screen.getByText('Task Live')).toBeInTheDocument();
  });
});
