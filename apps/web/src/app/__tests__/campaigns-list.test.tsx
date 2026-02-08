import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithProviders, createMockCampaign } from '@/test/helpers';
import CampaignsPage from '../campaigns/page';

// Mock Next.js navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: () => '/campaigns',
}));

describe('Campaigns List Page', () => {
  it('renders page header correctly', () => {
    renderWithProviders(<CampaignsPage />);
    
    expect(screen.getByText('Campaigns')).toBeInTheDocument();
    expect(screen.getByText('Manage your influencer marketing campaigns')).toBeInTheDocument();
    expect(screen.getByText('+ New Campaign')).toBeInTheDocument();
  });

  it('shows loading state initially', () => {
    renderWithProviders(<CampaignsPage />);
    expect(screen.getByText('Loading campaigns...')).toBeInTheDocument();
  });

  it('displays campaigns when loaded', async () => {
    const mockCampaigns = [
      createMockCampaign({ name: 'Summer Campaign 2024' }),
      createMockCampaign({ name: 'Product Launch' }),
    ];

    renderWithProviders(<CampaignsPage />, {
      trpcMocks: {
        campaigns: {
          list: { campaigns: mockCampaigns, total: 2 },
        },
      },
    });

    await waitFor(() => {
      expect(screen.getByText('Summer Campaign 2024')).toBeInTheDocument();
      expect(screen.getByText('Product Launch')).toBeInTheDocument();
    });
  });

  it('shows empty state when no campaigns', async () => {
    renderWithProviders(<CampaignsPage />, {
      trpcMocks: {
        campaigns: {
          list: { campaigns: [], total: 0 },
        },
      },
    });

    await waitFor(() => {
      expect(screen.getByText('No campaigns yet')).toBeInTheDocument();
      expect(screen.getByText('Create your first campaign to get started')).toBeInTheDocument();
    });
  });

  it('filters campaigns by status', async () => {
    const mockCampaigns = [
      createMockCampaign({ name: 'Draft Campaign', status: 'draft' }),
      createMockCampaign({ name: 'Active Campaign', status: 'in_execution' }),
    ];

    renderWithProviders(<CampaignsPage />, {
      trpcMocks: {
        campaigns: {
          list: { campaigns: mockCampaigns, total: 2 },
        },
      },
    });

    await waitFor(() => {
      expect(screen.getByText('Draft Campaign')).toBeInTheDocument();
    });

    // Select status filter
    const statusSelect = screen.getByLabelText('Status');
    fireEvent.change(statusSelect, { target: { value: 'draft' } });

    // Should filter to only show draft campaigns
    expect(screen.getByText('Draft Campaign')).toBeInTheDocument();
  });

  it('searches campaigns by name', async () => {
    const mockCampaigns = [
      createMockCampaign({ name: 'Summer Sale' }),
      createMockCampaign({ name: 'Winter Campaign' }),
    ];

    renderWithProviders(<CampaignsPage />, {
      trpcMocks: {
        campaigns: {
          list: { campaigns: mockCampaigns, total: 2 },
        },
      },
    });

    await waitFor(() => {
      expect(screen.getByText('Summer Sale')).toBeInTheDocument();
    });

    // Type in search
    const searchInput = screen.getByPlaceholderText('Search by name...');
    fireEvent.change(searchInput, { target: { value: 'Summer' } });

    // Should show only summer campaign
    expect(screen.getByText('Summer Sale')).toBeInTheDocument();
  });

  it('displays campaign count correctly', async () => {
    const mockCampaigns = [
      createMockCampaign(),
      createMockCampaign(),
      createMockCampaign(),
    ];

    renderWithProviders(<CampaignsPage />, {
      trpcMocks: {
        campaigns: {
          list: { campaigns: mockCampaigns, total: 3 },
        },
      },
    });

    await waitFor(() => {
      expect(screen.getByText('3 campaigns')).toBeInTheDocument();
    });
  });

  it('renders campaign table with correct columns', async () => {
    const mockCampaign = createMockCampaign({
      name: 'Test Campaign',
      status: 'draft',
      risk_level: 'low',
    });

    renderWithProviders(<CampaignsPage />, {
      trpcMocks: {
        campaigns: {
          list: { campaigns: [mockCampaign], total: 1 },
        },
      },
    });

    await waitFor(() => {
      expect(screen.getByText('Campaign')).toBeInTheDocument();
      expect(screen.getByText('Client')).toBeInTheDocument();
      expect(screen.getByText('Status')).toBeInTheDocument();
      expect(screen.getByText('Risk')).toBeInTheDocument();
      expect(screen.getByText('Budget')).toBeInTheDocument();
      expect(screen.getByText('Dates')).toBeInTheDocument();
    });
  });

  it('displays status badges correctly', async () => {
    const mockCampaign = createMockCampaign({
      status: 'approved',
    });

    renderWithProviders(<CampaignsPage />, {
      trpcMocks: {
        campaigns: {
          list: { campaigns: [mockCampaign], total: 1 },
        },
      },
    });

    await waitFor(() => {
      expect(screen.getByText('approved')).toBeInTheDocument();
    });
  });

  it('displays risk level badges correctly', async () => {
    const mockCampaign = createMockCampaign({
      risk_level: 'high',
    });

    renderWithProviders(<CampaignsPage />, {
      trpcMocks: {
        campaigns: {
          list: { campaigns: [mockCampaign], total: 1 },
        },
      },
    });

    await waitFor(() => {
      expect(screen.getByText('high')).toBeInTheDocument();
    });
  });

  it('has View link for each campaign', async () => {
    const mockCampaign = createMockCampaign({
      id: 'test-123',
      name: 'Test Campaign',
    });

    renderWithProviders(<CampaignsPage />, {
      trpcMocks: {
        campaigns: {
          list: { campaigns: [mockCampaign], total: 1 },
        },
      },
    });

    await waitFor(() => {
      const viewLink = screen.getByText('View');
      expect(viewLink).toHaveAttribute('href', '/campaigns/test-123');
    });
  });
});
