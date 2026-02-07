import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import CampaignsPage from '../page'
import type { Campaign, CampaignStatistics } from '@/../../packages/database/src/types'

// Mock Next.js Link
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}))

// Mock the hooks
const mockUseCampaigns = vi.fn()
const mockUseCampaignStatistics = vi.fn()

vi.mock('@/hooks/useCampaigns', () => ({
  useCampaigns: () => mockUseCampaigns(),
  useCampaignStatistics: () => mockUseCampaignStatistics(),
}))

// Mock the CampaignCard component
vi.mock('@/components/campaigns/CampaignCard', () => ({
  CampaignCard: ({ campaign }: { campaign: Campaign }) => (
    <div data-testid="campaign-card">{campaign.name}</div>
  ),
}))

describe('CampaignsPage', () => {
  const mockCampaign: Campaign = {
    id: 'campaign-1',
    name: 'Test Campaign',
    description: 'Test Description',
    status: 'draft',
    risk_level: 'low',
    client_id: 'client-1',
    created_by: 'user-1',
    budget: 50000,
    actual_spend: 10000,
    start_date: '2026-06-01',
    end_date: '2026-08-31',
    objectives: null,
    target_audience: null,
    deliverables: null,
    kpis: null,
    risk_flags: null,
    missing_info: null,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
    deleted_at: null,
  }

  const mockStatistics: CampaignStatistics = {
    total: 10,
    by_status: {
      draft: 3,
      planning: 2,
      brief_review: 0,
      strategy_approval: 0,
      creator_selection: 0,
      content_production: 1,
      content_approval: 0,
      publishing: 0,
      monitoring: 2,
      reporting: 0,
      closed: 2,
    },
    by_risk: {
      low: 6,
      medium: 3,
      high: 1,
      critical: 0,
    },
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render page header and title', () => {
    mockUseCampaigns.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    })
    mockUseCampaignStatistics.mockReturnValue({
      data: mockStatistics,
    })

    render(<CampaignsPage />)

    expect(screen.getByText('Campaigns')).toBeInTheDocument()
    expect(screen.getByText('Manage all your marketing campaigns')).toBeInTheDocument()
  })

  it('should render new campaign button', () => {
    mockUseCampaigns.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    })
    mockUseCampaignStatistics.mockReturnValue({
      data: mockStatistics,
    })

    render(<CampaignsPage />)

    const newButton = screen.getByText('+ New Campaign')
    expect(newButton).toBeInTheDocument()
    expect(newButton.closest('a')).toHaveAttribute('href', '/campaigns/new')
  })

  it('should display statistics correctly', () => {
    mockUseCampaigns.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    })
    mockUseCampaignStatistics.mockReturnValue({
      data: mockStatistics,
    })

    render(<CampaignsPage />)

    expect(screen.getByText('Total Campaigns')).toBeInTheDocument()
    expect(screen.getByText('10')).toBeInTheDocument() // total
    
    expect(screen.getByText('Active')).toBeInTheDocument()
    expect(screen.getByText('5')).toBeInTheDocument() // planning + content_production + monitoring
    
    expect(screen.getByText('In Draft')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument() // draft
    
    expect(screen.getByText('High Risk')).toBeInTheDocument()
    expect(screen.getByText('1')).toBeInTheDocument() // high + critical
  })

  it('should display campaign cards when campaigns are loaded', () => {
    mockUseCampaigns.mockReturnValue({
      data: [mockCampaign, { ...mockCampaign, id: 'campaign-2', name: 'Campaign 2' }],
      isLoading: false,
      error: null,
    })
    mockUseCampaignStatistics.mockReturnValue({
      data: mockStatistics,
    })

    render(<CampaignsPage />)

    const cards = screen.getAllByTestId('campaign-card')
    expect(cards).toHaveLength(2)
    expect(screen.getByText('Test Campaign')).toBeInTheDocument()
    expect(screen.getByText('Campaign 2')).toBeInTheDocument()
  })

  it('should display loading state', () => {
    mockUseCampaigns.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    })
    mockUseCampaignStatistics.mockReturnValue({
      data: undefined,
    })

    render(<CampaignsPage />)

    expect(screen.getByText('Loading campaigns...')).toBeInTheDocument()
  })

  it('should display error state', () => {
    mockUseCampaigns.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: { message: 'Failed to load campaigns' },
    })
    mockUseCampaignStatistics.mockReturnValue({
      data: undefined,
    })

    render(<CampaignsPage />)

    expect(screen.getByText(/Error loading campaigns/)).toBeInTheDocument()
  })

  it('should display empty state when no campaigns', () => {
    mockUseCampaigns.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    })
    mockUseCampaignStatistics.mockReturnValue({
      data: mockStatistics,
    })

    render(<CampaignsPage />)

    expect(screen.getByText('No campaigns found')).toBeInTheDocument()
    expect(screen.getByText(/Create your first campaign/)).toBeInTheDocument()
  })

  it('should render status filter dropdown', () => {
    mockUseCampaigns.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    })
    mockUseCampaignStatistics.mockReturnValue({
      data: mockStatistics,
    })

    render(<CampaignsPage />)

    expect(screen.getByLabelText('Status')).toBeInTheDocument()
    const statusSelect = screen.getByLabelText('Status') as HTMLSelectElement
    expect(statusSelect.value).toBe('')
  })

  it('should render risk level filter dropdown', () => {
    mockUseCampaigns.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    })
    mockUseCampaignStatistics.mockReturnValue({
      data: mockStatistics,
    })

    render(<CampaignsPage />)

    expect(screen.getByLabelText('Risk Level')).toBeInTheDocument()
    const riskSelect = screen.getByLabelText('Risk Level') as HTMLSelectElement
    expect(riskSelect.value).toBe('')
  })

  it('should update status filter when changed', () => {
    const mockReturnValue = {
      data: [],
      isLoading: false,
      error: null,
    }
    mockUseCampaigns.mockReturnValue(mockReturnValue)
    mockUseCampaignStatistics.mockReturnValue({
      data: mockStatistics,
    })

    render(<CampaignsPage />)

    const statusSelect = screen.getByLabelText('Status') as HTMLSelectElement
    fireEvent.change(statusSelect, { target: { value: 'draft' } })

    expect(statusSelect.value).toBe('draft')
  })

  it('should update risk filter when changed', () => {
    const mockReturnValue = {
      data: [],
      isLoading: false,
      error: null,
    }
    mockUseCampaigns.mockReturnValue(mockReturnValue)
    mockUseCampaignStatistics.mockReturnValue({
      data: mockStatistics,
    })

    render(<CampaignsPage />)

    const riskSelect = screen.getByLabelText('Risk Level') as HTMLSelectElement
    fireEvent.change(riskSelect, { target: { value: 'high' } })

    expect(riskSelect.value).toBe('high')
  })

  it('should clear filters when clear button is clicked', () => {
    const mockReturnValue = {
      data: [],
      isLoading: false,
      error: null,
    }
    mockUseCampaigns.mockReturnValue(mockReturnValue)
    mockUseCampaignStatistics.mockReturnValue({
      data: mockStatistics,
    })

    render(<CampaignsPage />)

    const statusSelect = screen.getByLabelText('Status') as HTMLSelectElement
    const riskSelect = screen.getByLabelText('Risk Level') as HTMLSelectElement
    
    // Set filters
    fireEvent.change(statusSelect, { target: { value: 'draft' } })
    fireEvent.change(riskSelect, { target: { value: 'high' } })
    
    // Clear filters
    const clearButton = screen.getByText('Clear Filters')
    fireEvent.click(clearButton)
    
    expect(statusSelect.value).toBe('')
    expect(riskSelect.value).toBe('')
  })

  it('should not render statistics when stats are not loaded', () => {
    mockUseCampaigns.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    })
    mockUseCampaignStatistics.mockReturnValue({
      data: undefined,
    })

    render(<CampaignsPage />)

    expect(screen.queryByText('Total Campaigns')).not.toBeInTheDocument()
  })

  it('should display campaigns in grid layout', () => {
    mockUseCampaigns.mockReturnValue({
      data: [mockCampaign],
      isLoading: false,
      error: null,
    })
    mockUseCampaignStatistics.mockReturnValue({
      data: mockStatistics,
    })

    const { container } = render(<CampaignsPage />)

    const grid = container.querySelector('.grid')
    expect(grid).toHaveClass('grid-cols-1', 'md:grid-cols-2', 'lg:grid-cols-3')
  })
})
