import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { renderWithProviders, createMockClient } from '@/test/helpers';
import ClientsPage from '../clients/page';

// Mock Next.js navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
  usePathname: () => '/clients',
}));

describe('Clients List Page', () => {
  it('renders page header', () => {
    renderWithProviders(<ClientsPage />);
    
    expect(screen.getByText('Clients')).toBeInTheDocument();
    expect(screen.getByText(/manage your client/i)).toBeInTheDocument();
  });

  it('shows loading state', () => {
    renderWithProviders(<ClientsPage />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('displays clients when loaded', async () => {
    const mockClients = [
      createMockClient({ name: 'Client A', tier: 'gold' }),
      createMockClient({ name: 'Client B', tier: 'silver' }),
    ];

    renderWithProviders(<ClientsPage />, {
      trpcMocks: {
        clients: {
          list: { clients: mockClients, total: 2 },
        },
      },
    });

    await waitFor(() => {
      expect(screen.getByText('Client A')).toBeInTheDocument();
      expect(screen.getByText('Client B')).toBeInTheDocument();
    });
  });

  it('shows empty state', async () => {
    renderWithProviders(<ClientsPage />, {
      trpcMocks: {
        clients: {
          list: { clients: [], total: 0 },
        },
      },
    });

    await waitFor(() => {
      expect(screen.getByText(/no clients/i)).toBeInTheDocument();
    });
  });

  it('displays client tiers', async () => {
    const mockClients = [
      createMockClient({ name: 'Gold Client', tier: 'gold' }),
    ];

    renderWithProviders(<ClientsPage />, {
      trpcMocks: {
        clients: {
          list: { clients: mockClients, total: 1 },
        },
      },
    });

    await waitFor(() => {
      expect(screen.getByText('gold')).toBeInTheDocument();
    });
  });

  it('has create client button', () => {
    renderWithProviders(<ClientsPage />);
    expect(screen.getByText(/new client/i)).toBeInTheDocument();
  });

  it('displays client count', async () => {
    const mockClients = [
      createMockClient(),
      createMockClient(),
      createMockClient(),
    ];

    renderWithProviders(<ClientsPage />, {
      trpcMocks: {
        clients: {
          list: { clients: mockClients, total: 3 },
        },
      },
    });

    await waitFor(() => {
      expect(screen.getByText(/3 client/)).toBeInTheDocument();
    });
  });

  it('has view links for each client', async () => {
    const mockClients = [
      createMockClient({ id: 'client-123', name: 'Test Client' }),
    ];

    renderWithProviders(<ClientsPage />, {
      trpcMocks: {
        clients: {
          list: { clients: mockClients, total: 1 },
        },
      },
    });

    await waitFor(() => {
      const viewLink = screen.getByText('View');
      expect(viewLink).toHaveAttribute('href', '/clients/client-123');
    });
  });
});
