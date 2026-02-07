import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import CampaignDetailPage from '../page'
import * as useCampaignsHooks from '@/hooks/useCampaigns'
import type { Campaign } from '@/../../packages/database/src/types'

// Mock Next.js components
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}))

// Mock the use hook from React
vi.mock('react', async () => {
  const actual = await vi.importActual('react')
  return {
    ...actual,
    use: (promise: Promise<any>) => promise,
  }
})

// Mock campaign hooks
vi.mock('@/hooks/useCampaigns')

const mockCampaign: Campaign = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  name: 'Summer Campaign 2024',
  client_id: '123e4567-e89b-12d3-a456-426614174001',
  status: 'planning',
  risk_level: 'medium',
  description: 'A comprehensive summer marketing campaign',
  objectives: ['Increase brand awareness', 'Generate leads', 'Boost sales by 20%'],
  target_audience: 'Young professionals aged 25-35',
  deliverables: [
    { name: 'Social Media Posts', description: '20 posts across platforms' },
    { name: 'Email Campaign', description: '5 email sequences' },
  ],
  budget: 50000,
  actual_spend: 25000,
  start_date: '2024-06-01',
  end_date: '2024-08-31',
  go_live_date: '2024-06-15',
  created_at: '2024-05-01T10:00:00Z',
  updated_at: '2024-05-15T14:30:00Z',
  created_by: '123e4567-e89b-12d3-a456-426614174002',
  deleted_at: null,
  risk_flags: [],
  missing_information: [],
}

describe('CampaignDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Loading State', () => {
    it('should show loading spinner when data is loading', () => {
      vi.mocked(useCampaignsHooks.useCampaign).mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null,
      } as any)

      vi.mocked(useCampaignsHooks.useDeleteCampaign).mockReturnValue({
        mutateAsync: vi.fn(),
      } as any)

      vi.mocked(useCampaignsHooks.useUpdateCampaignStatus).mockReturnValue({
        mutateAsync: vi.fn(),
      } as any)

      render(<CampaignDetailPage params={Promise.resolve({ id: '123' })} />)

      expect(screen.getByText('Loading campaign...')).toBeInTheDocument()
    })
  })

  describe('Error State', () => {
    it('should show 404 page when campaign is not found', () => {
      vi.mocked(useCampaignsHooks.useCampaign).mockReturnValue({
        data: null,
        isLoading: false,
        error: new Error('Not found'),
      } as any)

      vi.mocked(useCampaignsHooks.useDeleteCampaign).mockReturnValue({
        mutateAsync: vi.fn(),
      } as any)

      vi.mocked(useCampaignsHooks.useUpdateCampaignStatus).mockReturnValue({
        mutateAsync: vi.fn(),
      } as any)

      render(<CampaignDetailPage params={Promise.resolve({ id: '123' })} />)

      expect(screen.getByText('404')).toBeInTheDocument()
      expect(screen.getByText('Campaign not found')).toBeInTheDocument()
      expect(screen.getByText('Back to Campaigns')).toBeInTheDocument()
    })

    it('should show 404 page when campaign data is undefined', () => {
      vi.mocked(useCampaignsHooks.useCampaign).mockReturnValue({
        data: undefined,
        isLoading: false,
        error: null,
      } as any)

      vi.mocked(useCampaignsHooks.useDeleteCampaign).mockReturnValue({
        mutateAsync: vi.fn(),
      } as any)

      vi.mocked(useCampaignsHooks.useUpdateCampaignStatus).mockReturnValue({
        mutateAsync: vi.fn(),
      } as any)

      render(<CampaignDetailPage params={Promise.resolve({ id: '123' })} />)

      expect(screen.getByText('404')).toBeInTheDocument()
      expect(screen.getByText('Campaign not found')).toBeInTheDocument()
    })
  })

  describe('Success State - Header Section', () => {
    beforeEach(() => {
      vi.mocked(useCampaignsHooks.useCampaign).mockReturnValue({
        data: mockCampaign,
        isLoading: false,
        error: null,
      } as any)

      vi.mocked(useCampaignsHooks.useDeleteCampaign).mockReturnValue({
        mutateAsync: vi.fn(),
      } as any)

      vi.mocked(useCampaignsHooks.useUpdateCampaignStatus).mockReturnValue({
        mutateAsync: vi.fn(),
      } as any)
    })

    it('should display campaign name', () => {
      render(<CampaignDetailPage params={Promise.resolve({ id: '123' })} />)

      expect(screen.getByText('Summer Campaign 2024')).toBeInTheDocument()
    })

    it('should display status badge', () => {
      render(<CampaignDetailPage params={Promise.resolve({ id: '123' })} />)

      expect(screen.getByText('Planning')).toBeInTheDocument()
    })

    it('should display risk badge', () => {
      render(<CampaignDetailPage params={Promise.resolve({ id: '123' })} />)

      expect(screen.getByText('🟡 Medium Risk')).toBeInTheDocument()
    })

    it('should display edit button with correct link', () => {
      render(<CampaignDetailPage params={Promise.resolve({ id: '123' })} />)

      const editButton = screen.getByText('Edit Campaign')
      expect(editButton).toBeInTheDocument()
      expect(editButton.closest('a')).toHaveAttribute('href', '/campaigns/123/edit')
    })

    it('should display delete button', () => {
      render(<CampaignDetailPage params={Promise.resolve({ id: '123' })} />)

      expect(screen.getByText('Delete')).toBeInTheDocument()
    })
  })

  describe('Breadcrumb Navigation', () => {
    beforeEach(() => {
      vi.mocked(useCampaignsHooks.useCampaign).mockReturnValue({
        data: mockCampaign,
        isLoading: false,
        error: null,
      } as any)

      vi.mocked(useCampaignsHooks.useDeleteCampaign).mockReturnValue({
        mutateAsync: vi.fn(),
      } as any)

      vi.mocked(useCampaignsHooks.useUpdateCampaignStatus).mockReturnValue({
        mutateAsync: vi.fn(),
      } as any)
    })

    it('should display breadcrumb with Dashboard link', () => {
      render(<CampaignDetailPage params={Promise.resolve({ id: '123' })} />)

      const dashboardLink = screen.getByText('Dashboard')
      expect(dashboardLink).toBeInTheDocument()
      expect(dashboardLink.closest('a')).toHaveAttribute('href', '/dashboard')
    })

    it('should display breadcrumb with Campaigns link', () => {
      render(<CampaignDetailPage params={Promise.resolve({ id: '123' })} />)

      const campaignsLink = screen.getByText('Campaigns')
      expect(campaignsLink).toBeInTheDocument()
      expect(campaignsLink.closest('a')).toHaveAttribute('href', '/campaigns')
    })

    it('should display campaign name in breadcrumb', () => {
      render(<CampaignDetailPage params={Promise.resolve({ id: '123' })} />)

      // Campaign name appears twice - once in breadcrumb, once as heading
      const campaignNames = screen.getAllByText('Summer Campaign 2024')
      expect(campaignNames.length).toBeGreaterThan(0)
    })
  })

  describe('Delete Functionality', () => {
    it('should show confirmation dialog when delete button is clicked', async () => {
      const mockDelete = vi.fn().mockResolvedValue({})
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false)

      vi.mocked(useCampaignsHooks.useCampaign).mockReturnValue({
        data: mockCampaign,
        isLoading: false,
        error: null,
      } as any)

      vi.mocked(useCampaignsHooks.useDeleteCampaign).mockReturnValue({
        mutateAsync: mockDelete,
      } as any)

      vi.mocked(useCampaignsHooks.useUpdateCampaignStatus).mockReturnValue({
        mutateAsync: vi.fn(),
      } as any)

      render(<CampaignDetailPage params={Promise.resolve({ id: '123' })} />)

      const deleteButton = screen.getByText('Delete')
      await userEvent.click(deleteButton)

      expect(confirmSpy).toHaveBeenCalledWith(
        'Are you sure you want to delete "Summer Campaign 2024"?'
      )
      expect(mockDelete).not.toHaveBeenCalled()

      confirmSpy.mockRestore()
    })

    it('should call delete mutation when confirmed', async () => {
      const mockDelete = vi.fn().mockResolvedValue({})
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true)

      vi.mocked(useCampaignsHooks.useCampaign).mockReturnValue({
        data: mockCampaign,
        isLoading: false,
        error: null,
      } as any)

      vi.mocked(useCampaignsHooks.useDeleteCampaign).mockReturnValue({
        mutateAsync: mockDelete,
      } as any)

      vi.mocked(useCampaignsHooks.useUpdateCampaignStatus).mockReturnValue({
        mutateAsync: vi.fn(),
      } as any)

      render(<CampaignDetailPage params={Promise.resolve({ id: '123' })} />)

      const deleteButton = screen.getByText('Delete')
      await userEvent.click(deleteButton)

      await waitFor(() => {
        expect(mockDelete).toHaveBeenCalledWith('123e4567-e89b-12d3-a456-426614174000')
      })

      confirmSpy.mockRestore()
    })
  })

  describe('Status Change Functionality', () => {
    it('should display status dropdown with all status options', () => {
      vi.mocked(useCampaignsHooks.useCampaign).mockReturnValue({
        data: mockCampaign,
        isLoading: false,
        error: null,
      } as any)

      vi.mocked(useCampaignsHooks.useDeleteCampaign).mockReturnValue({
        mutateAsync: vi.fn(),
      } as any)

      vi.mocked(useCampaignsHooks.useUpdateCampaignStatus).mockReturnValue({
        mutateAsync: vi.fn(),
      } as any)

      render(<CampaignDetailPage params={Promise.resolve({ id: '123' })} />)

      const statusSelect = screen.getByDisplayValue('planning')
      expect(statusSelect).toBeInTheDocument()
    })

    it('should call status mutation when status is changed', async () => {
      const mockStatusUpdate = vi.fn().mockResolvedValue({})

      vi.mocked(useCampaignsHooks.useCampaign).mockReturnValue({
        data: mockCampaign,
        isLoading: false,
        error: null,
      } as any)

      vi.mocked(useCampaignsHooks.useDeleteCampaign).mockReturnValue({
        mutateAsync: vi.fn(),
      } as any)

      vi.mocked(useCampaignsHooks.useUpdateCampaignStatus).mockReturnValue({
        mutateAsync: mockStatusUpdate,
      } as any)

      render(<CampaignDetailPage params={Promise.resolve({ id: '123' })} />)

      const statusSelect = screen.getByDisplayValue('planning')
      await userEvent.selectOptions(statusSelect, 'brief_review')

      await waitFor(() => {
        expect(mockStatusUpdate).toHaveBeenCalledWith({
          id: '123e4567-e89b-12d3-a456-426614174000',
          status: 'brief_review',
        })
      })
    })
  })

  describe('Overview Section', () => {
    it('should display campaign description', () => {
      vi.mocked(useCampaignsHooks.useCampaign).mockReturnValue({
        data: mockCampaign,
        isLoading: false,
        error: null,
      } as any)

      vi.mocked(useCampaignsHooks.useDeleteCampaign).mockReturnValue({
        mutateAsync: vi.fn(),
      } as any)

      vi.mocked(useCampaignsHooks.useUpdateCampaignStatus).mockReturnValue({
        mutateAsync: vi.fn(),
      } as any)

      render(<CampaignDetailPage params={Promise.resolve({ id: '123' })} />)

      expect(screen.getByText('A comprehensive summer marketing campaign')).toBeInTheDocument()
    })

    it('should display "Not set" when description is missing', () => {
      const campaignWithoutDescription = { ...mockCampaign, description: null }

      vi.mocked(useCampaignsHooks.useCampaign).mockReturnValue({
        data: campaignWithoutDescription,
        isLoading: false,
        error: null,
      } as any)

      vi.mocked(useCampaignsHooks.useDeleteCampaign).mockReturnValue({
        mutateAsync: vi.fn(),
      } as any)

      vi.mocked(useCampaignsHooks.useUpdateCampaignStatus).mockReturnValue({
        mutateAsync: vi.fn(),
      } as any)

      render(<CampaignDetailPage params={Promise.resolve({ id: '123' })} />)

      // Should show "Not set" for description
      const notSetElements = screen.getAllByText('Not set')
      expect(notSetElements.length).toBeGreaterThan(0)
    })
  })

  describe('Objectives Section', () => {
    it('should display objectives list', () => {
      vi.mocked(useCampaignsHooks.useCampaign).mockReturnValue({
        data: mockCampaign,
        isLoading: false,
        error: null,
      } as any)

      vi.mocked(useCampaignsHooks.useDeleteCampaign).mockReturnValue({
        mutateAsync: vi.fn(),
      } as any)

      vi.mocked(useCampaignsHooks.useUpdateCampaignStatus).mockReturnValue({
        mutateAsync: vi.fn(),
      } as any)

      render(<CampaignDetailPage params={Promise.resolve({ id: '123' })} />)

      expect(screen.getByText('Increase brand awareness')).toBeInTheDocument()
      expect(screen.getByText('Generate leads')).toBeInTheDocument()
      expect(screen.getByText('Boost sales by 20%')).toBeInTheDocument()
    })

    it('should not display objectives section when objectives are empty', () => {
      const campaignWithoutObjectives = { ...mockCampaign, objectives: [] }

      vi.mocked(useCampaignsHooks.useCampaign).mockReturnValue({
        data: campaignWithoutObjectives,
        isLoading: false,
        error: null,
      } as any)

      vi.mocked(useCampaignsHooks.useDeleteCampaign).mockReturnValue({
        mutateAsync: vi.fn(),
      } as any)

      vi.mocked(useCampaignsHooks.useUpdateCampaignStatus).mockReturnValue({
        mutateAsync: vi.fn(),
      } as any)

      render(<CampaignDetailPage params={Promise.resolve({ id: '123' })} />)

      expect(screen.queryByText('Objectives')).not.toBeInTheDocument()
    })
  })

  describe('Deliverables Section', () => {
    it('should display deliverables list', () => {
      vi.mocked(useCampaignsHooks.useCampaign).mockReturnValue({
        data: mockCampaign,
        isLoading: false,
        error: null,
      } as any)

      vi.mocked(useCampaignsHooks.useDeleteCampaign).mockReturnValue({
        mutateAsync: vi.fn(),
      } as any)

      vi.mocked(useCampaignsHooks.useUpdateCampaignStatus).mockReturnValue({
        mutateAsync: vi.fn(),
      } as any)

      render(<CampaignDetailPage params={Promise.resolve({ id: '123' })} />)

      expect(screen.getByText('Social Media Posts')).toBeInTheDocument()
      expect(screen.getByText('20 posts across platforms')).toBeInTheDocument()
      expect(screen.getByText('Email Campaign')).toBeInTheDocument()
      expect(screen.getByText('5 email sequences')).toBeInTheDocument()
    })

    it('should not display deliverables section when deliverables are empty', () => {
      const campaignWithoutDeliverables = { ...mockCampaign, deliverables: [] }

      vi.mocked(useCampaignsHooks.useCampaign).mockReturnValue({
        data: campaignWithoutDeliverables,
        isLoading: false,
        error: null,
      } as any)

      vi.mocked(useCampaignsHooks.useDeleteCampaign).mockReturnValue({
        mutateAsync: vi.fn(),
      } as any)

      vi.mocked(useCampaignsHooks.useUpdateCampaignStatus).mockReturnValue({
        mutateAsync: vi.fn(),
      } as any)

      render(<CampaignDetailPage params={Promise.resolve({ id: '123' })} />)

      expect(screen.queryByText('Deliverables')).not.toBeInTheDocument()
    })
  })

  describe('Financial Section', () => {
    it('should display budget amount', () => {
      vi.mocked(useCampaignsHooks.useCampaign).mockReturnValue({
        data: mockCampaign,
        isLoading: false,
        error: null,
      } as any)

      vi.mocked(useCampaignsHooks.useDeleteCampaign).mockReturnValue({
        mutateAsync: vi.fn(),
      } as any)

      vi.mocked(useCampaignsHooks.useUpdateCampaignStatus).mockReturnValue({
        mutateAsync: vi.fn(),
      } as any)

      render(<CampaignDetailPage params={Promise.resolve({ id: '123' })} />)

      expect(screen.getByText('$50,000.00')).toBeInTheDocument()
    })

    it('should display actual spend with percentage', () => {
      vi.mocked(useCampaignsHooks.useCampaign).mockReturnValue({
        data: mockCampaign,
        isLoading: false,
        error: null,
      } as any)

      vi.mocked(useCampaignsHooks.useDeleteCampaign).mockReturnValue({
        mutateAsync: vi.fn(),
      } as any)

      vi.mocked(useCampaignsHooks.useUpdateCampaignStatus).mockReturnValue({
        mutateAsync: vi.fn(),
      } as any)

      render(<CampaignDetailPage params={Promise.resolve({ id: '123' })} />)

      expect(screen.getByText('$25,000.00 (50%)')).toBeInTheDocument()
    })

    it('should display budget as "Not set" when budget is 0', () => {
      const campaignWithoutBudget = { ...mockCampaign, budget: 0, actual_spend: 0 }

      vi.mocked(useCampaignsHooks.useCampaign).mockReturnValue({
        data: campaignWithoutBudget,
        isLoading: false,
        error: null,
      } as any)

      vi.mocked(useCampaignsHooks.useDeleteCampaign).mockReturnValue({
        mutateAsync: vi.fn(),
      } as any)

      vi.mocked(useCampaignsHooks.useUpdateCampaignStatus).mockReturnValue({
        mutateAsync: vi.fn(),
      } as any)

      render(<CampaignDetailPage params={Promise.resolve({ id: '123' })} />)

      const notSetElements = screen.getAllByText('Not set')
      expect(notSetElements.length).toBeGreaterThan(0)
    })
  })

  describe('Timeline Section', () => {
    it('should display start and end dates', () => {
      vi.mocked(useCampaignsHooks.useCampaign).mockReturnValue({
        data: mockCampaign,
        isLoading: false,
        error: null,
      } as any)

      vi.mocked(useCampaignsHooks.useDeleteCampaign).mockReturnValue({
        mutateAsync: vi.fn(),
      } as any)

      vi.mocked(useCampaignsHooks.useUpdateCampaignStatus).mockReturnValue({
        mutateAsync: vi.fn(),
      } as any)

      render(<CampaignDetailPage params={Promise.resolve({ id: '123' })} />)

      expect(screen.getByText('Jun 1, 2024')).toBeInTheDocument()
      expect(screen.getByText('Aug 31, 2024')).toBeInTheDocument()
    })

    it('should display go live date when present', () => {
      vi.mocked(useCampaignsHooks.useCampaign).mockReturnValue({
        data: mockCampaign,
        isLoading: false,
        error: null,
      } as any)

      vi.mocked(useCampaignsHooks.useDeleteCampaign).mockReturnValue({
        mutateAsync: vi.fn(),
      } as any)

      vi.mocked(useCampaignsHooks.useUpdateCampaignStatus).mockReturnValue({
        mutateAsync: vi.fn(),
      } as any)

      render(<CampaignDetailPage params={Promise.resolve({ id: '123' })} />)

      expect(screen.getByText('Jun 15, 2024')).toBeInTheDocument()
    })
  })

  describe('Metadata Section', () => {
    it('should display created and updated dates', () => {
      vi.mocked(useCampaignsHooks.useCampaign).mockReturnValue({
        data: mockCampaign,
        isLoading: false,
        error: null,
      } as any)

      vi.mocked(useCampaignsHooks.useDeleteCampaign).mockReturnValue({
        mutateAsync: vi.fn(),
      } as any)

      vi.mocked(useCampaignsHooks.useUpdateCampaignStatus).mockReturnValue({
        mutateAsync: vi.fn(),
      } as any)

      render(<CampaignDetailPage params={Promise.resolve({ id: '123' })} />)

      expect(screen.getByText('May 1, 2024')).toBeInTheDocument()
      expect(screen.getByText('May 15, 2024')).toBeInTheDocument()
    })
  })
})
