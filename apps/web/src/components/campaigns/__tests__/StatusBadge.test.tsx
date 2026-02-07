import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { StatusBadge } from '../StatusBadge'
import type { CampaignStatus } from '@/../../packages/database/src/types'

describe('StatusBadge', () => {
  const statuses: CampaignStatus[] = [
    'draft',
    'planning',
    'brief_review',
    'strategy_approval',
    'creator_selection',
    'content_production',
    'content_approval',
    'publishing',
    'monitoring',
    'reporting',
    'closed',
  ]

  it.each(statuses)('renders %s status correctly', (status) => {
    render(<StatusBadge status={status} />)
    
    // Should render the badge
    const badge = screen.getByText(
      (content, element) => {
        return element?.tagName.toLowerCase() === 'span' && 
               element?.textContent !== null &&
               element?.textContent !== ''
      }
    )
    expect(badge).toBeInTheDocument()
  })

  it('renders draft status with correct label', () => {
    render(<StatusBadge status="draft" />)
    expect(screen.getByText('Draft')).toBeInTheDocument()
  })

  it('renders planning status with correct label', () => {
    render(<StatusBadge status="planning" />)
    expect(screen.getByText('Planning')).toBeInTheDocument()
  })

  it('renders brief_review status with correct label', () => {
    render(<StatusBadge status="brief_review" />)
    expect(screen.getByText('Brief Review')).toBeInTheDocument()
  })

  it('renders strategy_approval status with correct label', () => {
    render(<StatusBadge status="strategy_approval" />)
    expect(screen.getByText('Strategy Approval')).toBeInTheDocument()
  })

  it('renders creator_selection status with correct label', () => {
    render(<StatusBadge status="creator_selection" />)
    expect(screen.getByText('Creator Selection')).toBeInTheDocument()
  })

  it('renders content_production status with correct label', () => {
    render(<StatusBadge status="content_production" />)
    expect(screen.getByText('Content Production')).toBeInTheDocument()
  })

  it('renders content_approval status with correct label', () => {
    render(<StatusBadge status="content_approval" />)
    expect(screen.getByText('Content Approval')).toBeInTheDocument()
  })

  it('renders publishing status with correct label', () => {
    render(<StatusBadge status="publishing" />)
    expect(screen.getByText('Publishing')).toBeInTheDocument()
  })

  it('renders monitoring status with correct label', () => {
    render(<StatusBadge status="monitoring" />)
    expect(screen.getByText('Monitoring')).toBeInTheDocument()
  })

  it('renders reporting status with correct label', () => {
    render(<StatusBadge status="reporting" />)
    expect(screen.getByText('Reporting')).toBeInTheDocument()
  })

  it('renders closed status with correct label', () => {
    render(<StatusBadge status="closed" />)
    expect(screen.getByText('Closed')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(<StatusBadge status="draft" className="custom-class" />)
    const badge = container.querySelector('.custom-class')
    expect(badge).toBeInTheDocument()
  })

  it('has correct styling classes', () => {
    const { container } = render(<StatusBadge status="draft" />)
    const badge = container.querySelector('span')
    expect(badge?.className).toContain('inline-flex')
    expect(badge?.className).toContain('items-center')
    expect(badge?.className).toContain('px-2.5')
    expect(badge?.className).toContain('rounded-full')
  })
})
