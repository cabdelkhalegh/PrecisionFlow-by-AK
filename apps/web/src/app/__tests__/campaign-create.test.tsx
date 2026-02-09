import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithProviders, createMockClient } from '@/test/helpers';
import NewCampaignPage from '../campaigns/new/page';

// Mock Next.js navigation
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  usePathname: () => '/campaigns/new',
}));

describe('Campaign Creation Page', () => {
  beforeEach(() => {
    mockPush.mockClear();
  });

  it('renders form header correctly', () => {
    renderWithProviders(<NewCampaignPage />);
    
    expect(screen.getByText('Create New Campaign')).toBeInTheDocument();
    expect(screen.getByText('Set up a new influencer marketing campaign')).toBeInTheDocument();
  });

  it('renders all form fields', () => {
    renderWithProviders(<NewCampaignPage />);
    
    expect(screen.getByLabelText(/Campaign Name/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Client/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Start Date/)).toBeInTheDocument();
    expect(screen.getByLabelText(/End Date/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Total Budget/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Tags/)).toBeInTheDocument();
  });

  it('loads clients for dropdown', async () => {
    const mockClients = [
      createMockClient({ id: '1', name: 'Client A' }),
      createMockClient({ id: '2', name: 'Client B' }),
    ];

    renderWithProviders(<NewCampaignPage />, {
      trpcMocks: {
        clients: {
          list: { clients: mockClients, total: 2 },
        },
      },
    });

    await waitFor(() => {
      expect(screen.getByText(/Client A/)).toBeInTheDocument();
      expect(screen.getByText(/Client B/)).toBeInTheDocument();
    });
  });

  it('validates required fields', async () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    
    renderWithProviders(<NewCampaignPage />);
    
    const form = screen.getByText('Create Campaign').closest('form')!;
    fireEvent.submit(form);
    
    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith(
        expect.stringContaining('Please fill in all required fields')
      );
    });
    
    alertSpy.mockRestore();
  });

  it('accepts form input', () => {
    renderWithProviders(<NewCampaignPage />);
    
    const nameInput = screen.getByLabelText(/Campaign Name/) as HTMLInputElement;
    fireEvent.change(nameInput, { target: { value: 'Test Campaign' } });
    
    expect(nameInput.value).toBe('Test Campaign');
  });

  it('submits form with valid data', async () => {
    const mockClients = [
      createMockClient({ id: 'client-1', name: 'Test Client' }),
    ];

    const mockMutate = vi.fn();
    renderWithProviders(<NewCampaignPage />, {
      trpcMocks: {
        clients: {
          list: { clients: mockClients, total: 1 },
        },
        campaigns: {
          create: mockMutate,
        },
      },
    });

    // Fill in required fields
    const nameInput = screen.getByLabelText(/Campaign Name/);
    fireEvent.change(nameInput, { target: { value: 'New Campaign' } });

    await waitFor(() => {
      expect(screen.getByText(/Test Client/)).toBeInTheDocument();
    });

    const clientSelect = screen.getByLabelText(/Client/);
    fireEvent.change(clientSelect, { target: { value: 'client-1' } });

    // Submit form
    
    fireEvent.submit(screen.getByText('Create Campaign').closest('form')!);

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'New Campaign',
          clientId: 'client-1',
        })
      );
    });
  });

  it('handles submission errors', async () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    const mockClients = [createMockClient({ id: 'client-1', name: 'Test Client' })];

    renderWithProviders(<NewCampaignPage />, {
      trpcMocks: {
        clients: {
          list: { clients: mockClients, total: 1 },
        },
        campaigns: {
          create: {
            error: new Error('Database error'),
          },
        },
      },
    });

    const nameInput = screen.getByLabelText(/Campaign Name/);
    fireEvent.change(nameInput, { target: { value: 'Test' } });

    await waitFor(() => {
      expect(screen.getByText(/Test Client/)).toBeInTheDocument();
    });

    const clientSelect = screen.getByLabelText(/Client/);
    fireEvent.change(clientSelect, { target: { value: 'client-1' } });

    
    fireEvent.submit(screen.getByText('Create Campaign').closest('form')!);

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith(
        expect.stringContaining('Failed to create campaign')
      );
    });

    alertSpy.mockRestore();
  });

  it('disables submit button while submitting', async () => {
    const mockClients = [createMockClient({ id: 'client-1', name: 'Test Client' })];

    renderWithProviders(<NewCampaignPage />, {
      trpcMocks: {
        clients: {
          list: { clients: mockClients, total: 1 },
        },
      },
    });

    const nameInput = screen.getByLabelText(/Campaign Name/);
    fireEvent.change(nameInput, { target: { value: 'Test' } });

    await waitFor(() => {
      expect(screen.getByText(/Test Client/)).toBeInTheDocument();
    });

    const clientSelect = screen.getByLabelText(/Client/);
    fireEvent.change(clientSelect, { target: { value: 'client-1' } });

    
    fireEvent.submit(screen.getByText('Create Campaign').closest('form')!);

    // Button should be disabled during submission
    const btn = screen.getByText('Create Campaign') as HTMLButtonElement;
    expect(btn.disabled).toBe(true);
  });

  it('includes optional fields in submission', async () => {
    const mockClients = [createMockClient({ id: 'client-1', name: 'Test Client' })];
    const mockMutate = vi.fn();

    renderWithProviders(<NewCampaignPage />, {
      trpcMocks: {
        clients: {
          list: { clients: mockClients, total: 1 },
        },
        campaigns: {
          create: mockMutate,
        },
      },
    });

    // Fill all fields
    fireEvent.change(screen.getByLabelText(/Campaign Name/), {
      target: { value: 'Full Campaign' },
    });

    await waitFor(() => {
      expect(screen.getByText(/Test Client/)).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText(/Client/), {
      target: { value: 'client-1' },
    });
    
    fireEvent.change(screen.getByLabelText(/Start Date/), {
      target: { value: '2026-01-01' },
    });
    
    fireEvent.change(screen.getByLabelText(/End Date/), {
      target: { value: '2026-12-31' },
    });
    
    fireEvent.change(screen.getByLabelText(/Total Budget/), {
      target: { value: '50000' },
    });
    
    fireEvent.change(screen.getByLabelText(/Tags/), {
      target: { value: 'summer, launch, product' },
    });

    fireEvent.click(screen.getByText('Create Campaign'));

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Full Campaign',
          clientId: 'client-1',
          startDate: '2026-01-01',
          endDate: '2026-12-31',
          budgetTotal: 50000,
          tags: ['summer', 'launch', 'product'],
        })
      );
    });
  });

  it('parses tags correctly from comma-separated string', async () => {
    const mockClients = [createMockClient({ id: 'client-1', name: 'Test Client' })];
    const mockMutate = vi.fn();

    renderWithProviders(<NewCampaignPage />, {
      trpcMocks: {
        clients: {
          list: { clients: mockClients, total: 1 },
        },
        campaigns: {
          create: mockMutate,
        },
      },
    });

    fireEvent.change(screen.getByLabelText(/Campaign Name/), {
      target: { value: 'Test' },
    });

    await waitFor(() => {
      expect(screen.getByText(/Test Client/)).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText(/Client/), {
      target: { value: 'client-1' },
    });
    
    fireEvent.change(screen.getByLabelText(/Tags/), {
      target: { value: 'tag1, tag2,  tag3  ' }, // With extra spaces
    });

    fireEvent.click(screen.getByText('Create Campaign'));

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith(
        expect.objectContaining({
          tags: ['tag1', 'tag2', 'tag3'], // Trimmed and cleaned
        })
      );
    });
  });
});
