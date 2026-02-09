import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { renderWithProviders, createMockCampaign } from '@/test/helpers';
import DashboardPage from '../dashboard/page';

// Mock Next.js navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
  usePathname: () => '/dashboard',
}));

describe('Dashboard Page', () => {
  it('renders page header', () => {
    renderWithProviders(<DashboardPage />);
    
    expect(screen.getByRole('heading', { name: /dashboard/i })).toBeInTheDocument();
  });

  it('shows loading state', () => {
    renderWithProviders(<DashboardPage />);
    expect(screen.getByText(/Loading campaigns/i)).toBeInTheDocument();
  });

  it('displays campaign statistics', async () => {
    const mockCampaigns = [
      createMockCampaign({ status: 'draft' }),
      createMockCampaign({ status: 'approved' }),
      createMockCampaign({ status: 'in_execution' }),
    ];

    renderWithProviders(<DashboardPage />, {
      trpcMocks: {
        campaigns: {
          list: { campaigns: mockCampaigns, total: 3 },
        },
      },
    });

    await waitFor(() => {
      // Should show total campaigns
      expect(screen.getByText(/3/)).toBeInTheDocument();
    });
  });

  it('shows recent campaigns', async () => {
    const mockCampaigns = [
      createMockCampaign({ name: 'Recent Campaign 1' }),
      createMockCampaign({ name: 'Recent Campaign 2' }),
    ];

    renderWithProviders(<DashboardPage />, {
      trpcMocks: {
        campaigns: {
          list: { campaigns: mockCampaigns, total: 2 },
        },
      },
    });

    await waitFor(() => {
      expect(screen.getByText('Recent Campaign 1')).toBeInTheDocument();
      expect(screen.getByText('Recent Campaign 2')).toBeInTheDocument();
    });
  });

  it('has quick action buttons', async () => {
    renderWithProviders(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText(/new campaign/i)).toBeInTheDocument();
    });
  });

  it('displays empty state when no campaigns', async () => {
    renderWithProviders(<DashboardPage />, {
      trpcMocks: {
        campaigns: {
          list: { campaigns: [], total: 0 },
        },
      },
    });

    await waitFor(() => {
      expect(screen.getByText(/no campaigns/i)).toBeInTheDocument();
    });
  });
});
