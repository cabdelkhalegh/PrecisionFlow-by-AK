import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { RiskBadge } from '../RiskBadge'
import type { RiskLevel } from '@/../../packages/database/src/types'

describe('RiskBadge', () => {
  const riskLevels: RiskLevel[] = ['low', 'medium', 'high', 'critical']

  it.each(riskLevels)('renders %s risk level correctly', (level) => {
    const { container } = render(<RiskBadge level={level} />)
    
    // Should render the outer badge span
    const badge = container.querySelector('span[title]')
    expect(badge).toBeInTheDocument()
  })

  it('renders low risk with correct label and icon', () => {
    render(<RiskBadge level="low" />)
    expect(screen.getByText('Low Risk')).toBeInTheDocument()
    expect(screen.getByText('🟢')).toBeInTheDocument()
  })

  it('renders medium risk with correct label and icon', () => {
    render(<RiskBadge level="medium" />)
    expect(screen.getByText('Medium Risk')).toBeInTheDocument()
    expect(screen.getByText('🟡')).toBeInTheDocument()
  })

  it('renders high risk with correct label and icon', () => {
    render(<RiskBadge level="high" />)
    expect(screen.getByText('High Risk')).toBeInTheDocument()
    expect(screen.getByText('🟠')).toBeInTheDocument()
  })

  it('renders critical risk with correct label and icon', () => {
    render(<RiskBadge level="critical" />)
    expect(screen.getByText('Critical Risk')).toBeInTheDocument()
    expect(screen.getByText('🔴')).toBeInTheDocument()
  })

  it('has title attribute for accessibility', () => {
    render(<RiskBadge level="high" />)
    const badge = screen.getByTitle('High Risk')
    expect(badge).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(<RiskBadge level="low" className="custom-class" />)
    const badge = container.querySelector('.custom-class')
    expect(badge).toBeInTheDocument()
  })

  it('has correct styling classes', () => {
    const { container } = render(<RiskBadge level="low" />)
    const badge = container.querySelector('span')
    expect(badge?.className).toContain('inline-flex')
    expect(badge?.className).toContain('items-center')
    expect(badge?.className).toContain('gap-1')
    expect(badge?.className).toContain('rounded-full')
  })

  it('displays both icon and label', () => {
    const { container } = render(<RiskBadge level="medium" />)
    const spans = container.querySelectorAll('span')
    // Should have at least 3 spans: outer container, icon span, label span
    expect(spans.length).toBeGreaterThanOrEqual(3)
  })
})
