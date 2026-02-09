import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { renderWithProviders, createMockCampaign, createMockClient } from '@/test/helpers';
import CampaignDetailPage from '../campaigns/[id]/page';

// Mock Next.js navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
  useParams: () => ({
    id: 'test-campaign-id',
  }),
  usePathname: () => '/campaigns/test-campaign-id',
}));

describe('Campaign Detail Page', () => {
  it('shows loading state initially', () => {
    renderWithProviders(<CampaignDetailPage />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('displays campaign details when loaded', async () => {
    const mockCampaign = createMockCampaign({
      id: 'test-campaign-id',
      name: 'Test Campaign',
      status: 'approved',
      risk_level: 'low',
    });

    const mockClient = createMockClient({
      id: mockCampaign.client_id,
      name: 'Test Client',
    });

    renderWithProviders(<CampaignDetailPage />, {
      trpcMocks: {
        campaigns: {
          getById: mockCampaign,
        },
        clients: {
          getById: mockClient,
        },
      },
    });

    await waitFor(() => {
      expect(screen.getByText('Test Campaign')).toBeInTheDocument();
      expect(screen.getByText('Test Client')).toBeInTheDocument();
    });
  });

  it('displays campaign status badge', async () => {
    const mockCampaign = createMockCampaign({
      id: 'test-campaign-id',
      status: 'in_execution',
    });

    renderWithProviders(<CampaignDetailPage />, {
      trpcMocks: {
        campaigns: {
          getById: mockCampaign,
        },
      },
    });

    await waitFor(() => {
      expect(screen.getByText(/in execution/i)).toBeInTheDocument();
    });
  });

  it('displays risk level badge', async () => {
    const mockCampaign = createMockCampaign({
      id: 'test-campaign-id',
      risk_level: 'high',
    });

    renderWithProviders(<CampaignDetailPage />, {
      trpcMocks: {
        campaigns: {
          getById: mockCampaign,
        },
      },
    });

    await waitFor(() => {
      expect(screen.getByText(/high/)).toBeInTheDocument();
    });
  });

  it('shows 404 for non-existent campaign', async () => {
    renderWithProviders(<CampaignDetailPage />, {
      trpcMocks: {
        campaigns: {
          getById: {
            error: new Error('Campaign not found'),
          },
        },
      },
    });

    await waitFor(() => {
      expect(screen.getByText(/not found/i)).toBeInTheDocument();
    });
  });

  it('displays budget information', async () => {
    const mockCampaign = createMockCampaign({
      id: 'test-campaign-id',
      total_budget: 100000,
    });

    renderWithProviders(<CampaignDetailPage />, {
      trpcMocks: {
        campaigns: {
          getById: mockCampaign,
        },
      },
    });

    await waitFor(() => {
      expect(screen.getByText(/100,000/)).toBeInTheDocument();
    });
  });

  it('displays campaign dates', async () => {
    const mockCampaign = createMockCampaign({
      id: 'test-campaign-id',
      start_date: '2026-01-01',
      end_date: '2026-12-31',
    });

    renderWithProviders(<CampaignDetailPage />, {
      trpcMocks: {
        campaigns: {
          getById: mockCampaign,
        },
      },
    });

    await waitFor(() => {
      const dateElements = screen.getAllByText(/2026/);
      expect(dateElements.length).toBeGreaterThan(0);
    });
  });

  it('has upload brief button', async () => {
    const mockCampaign = createMockCampaign({
      id: 'test-campaign-id',
    });

    renderWithProviders(<CampaignDetailPage />, {
      trpcMocks: {
        campaigns: {
          getById: mockCampaign,
        },
      },
    });

    await waitFor(() => {
      expect(screen.getByText(/Upload Brief/)).toBeInTheDocument();
    });
  });
});
