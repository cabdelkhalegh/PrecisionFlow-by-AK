import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { CampaignCard } from '../CampaignCard'
import type { Campaign } from '@/../../packages/database/src/types'

// Mock Next.js Link component
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}))

describe('CampaignCard', () => {
  const mockCampaign: Campaign = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'Summer Campaign 2024',
    description: 'A great summer marketing campaign',
    status: 'planning',
    risk_level: 'low',
    client_id: '123e4567-e89b-12d3-a456-426614174001',
    created_by: '123e4567-e89b-12d3-a456-426614174002',
    budget_amount: 50000,
    budget_currency: 'USD',
    actual_spend: 10000,
    start_date: '2024-06-01',
    end_date: '2024-08-31',
    created_at: '2024-05-01T10:00:00Z',
    updated_at: '2024-05-01T10:00:00Z',
    deleted_at: null,
    objectives: null,
    target_audience: null,
    deliverables: null,
    kpis: null,
    missing_info_flags: null,
  }

  it('renders campaign name', () => {
    render(<CampaignCard campaign={mockCampaign} />)
    expect(screen.getByText('Summer Campaign 2024')).toBeInTheDocument()
  })

  it('renders campaign description', () => {
    render(<CampaignCard campaign={mockCampaign} />)
    expect(screen.getByText('A great summer marketing campaign')).toBeInTheDocument()
  })

  it('renders status badge', () => {
    render(<CampaignCard campaign={mockCampaign} />)
    expect(screen.getByText('Planning')).toBeInTheDocument()
  })

  it('renders risk badge', () => {
    render(<CampaignCard campaign={mockCampaign} />)
    expect(screen.getByText('Low Risk')).toBeInTheDocument()
  })

  it('renders budget amount correctly formatted', () => {
    render(<CampaignCard campaign={mockCampaign} />)
    expect(screen.getByText('$50,000.00')).toBeInTheDocument()
  })

  it('renders actual spend correctly formatted', () => {
    render(<CampaignCard campaign={mockCampaign} />)
    expect(screen.getByText(/\$10,000\.00/)).toBeInTheDocument()
  })

  it('displays budget spent percentage', () => {
    render(<CampaignCard campaign={mockCampaign} />)
    // 10000 / 50000 = 20%
    expect(screen.getByText('(20%)')).toBeInTheDocument()
  })

  it('renders start date formatted', () => {
    render(<CampaignCard campaign={mockCampaign} />)
    expect(screen.getByText('Jun 1, 2024')).toBeInTheDocument()
  })

  it('renders end date formatted', () => {
    render(<CampaignCard campaign={mockCampaign} />)
    expect(screen.getByText('Aug 31, 2024')).toBeInTheDocument()
  })

  it('renders created date formatted', () => {
    render(<CampaignCard campaign={mockCampaign} />)
    expect(screen.getByText(/Created May 1, 2024/)).toBeInTheDocument()
  })

  it('links to campaign detail page', () => {
    const { container } = render(<CampaignCard campaign={mockCampaign} />)
    const link = container.querySelector('a')
    expect(link?.getAttribute('href')).toBe('/campaigns/123e4567-e89b-12d3-a456-426614174000')
  })

  it('handles null budget gracefully', () => {
    const campaignWithoutBudget = { ...mockCampaign, budget_amount: null, actual_spend: null }
    render(<CampaignCard campaign={campaignWithoutBudget} />)
    const notSetTexts = screen.getAllByText('Not set')
    expect(notSetTexts.length).toBeGreaterThan(0)
  })

  it('handles missing description', () => {
    const campaignWithoutDescription = { ...mockCampaign, description: null }
    render(<CampaignCard campaign={campaignWithoutDescription} />)
    expect(screen.queryByText('A great summer marketing campaign')).not.toBeInTheDocument()
  })

  it('handles missing start date', () => {
    const campaignWithoutStartDate = { ...mockCampaign, start_date: null }
    render(<CampaignCard campaign={campaignWithoutStartDate} />)
    expect(screen.queryByText('Jun 1, 2024')).not.toBeInTheDocument()
  })

  it('handles missing end date', () => {
    const campaignWithoutEndDate = { ...mockCampaign, end_date: null }
    render(<CampaignCard campaign={campaignWithoutEndDate} />)
    expect(screen.queryByText('Aug 31, 2024')).not.toBeInTheDocument()
  })

  it('shows green percentage for low spend', () => {
    // 20% spent
    render(<CampaignCard campaign={mockCampaign} />)
    const percentage = screen.getByText('(20%)')
    expect(percentage.className).toContain('text-green-600')
  })

  it('shows yellow percentage for medium spend', () => {
    // 80% spent
    const highSpendCampaign = { ...mockCampaign, actual_spend: 40000 }
    render(<CampaignCard campaign={highSpendCampaign} />)
    const percentage = screen.getByText('(80%)')
    expect(percentage.className).toContain('text-yellow-600')
  })

  it('shows red percentage for high spend', () => {
    // 95% spent
    const veryHighSpendCampaign = { ...mockCampaign, actual_spend: 47500 }
    render(<CampaignCard campaign={veryHighSpendCampaign} />)
    const percentage = screen.getByText('(95%)')
    expect(percentage.className).toContain('text-red-600')
  })

  it('has hover effect styling', () => {
    const { container } = render(<CampaignCard campaign={mockCampaign} />)
    const card = container.querySelector('.hover\\:shadow-lg')
    expect(card).toBeInTheDocument()
  })

  it('has proper card structure', () => {
    const { container } = render(<CampaignCard campaign={mockCampaign} />)
    const card = container.querySelector('.bg-white.border.rounded-lg')
    expect(card).toBeInTheDocument()
  })
})
