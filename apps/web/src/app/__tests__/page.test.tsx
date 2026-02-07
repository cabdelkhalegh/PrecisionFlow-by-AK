import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import HomePage from '../page'

describe('HomePage', () => {
  it('renders the main heading', () => {
    render(<HomePage />)
    
    const heading = screen.getByRole('heading', { name: /TiKiT OS/i, level: 1 })
    expect(heading).toBeInTheDocument()
  })

  it('displays the tagline', () => {
    render(<HomePage />)
    
    expect(screen.getByText(/Campaign Execution & Intelligence Platform/i)).toBeInTheDocument()
  })

  it('displays the description', () => {
    render(<HomePage />)
    
    expect(screen.getByText(/Enterprise-grade operating system for influencer marketing agencies/i)).toBeInTheDocument()
  })

  it('renders a link to the dashboard', () => {
    render(<HomePage />)
    
    const dashboardLink = screen.getByRole('link', { name: /Go to Dashboard/i })
    expect(dashboardLink).toBeInTheDocument()
    expect(dashboardLink).toHaveAttribute('href', '/dashboard')
  })

  it('has appropriate styling classes', () => {
    const { container } = render(<HomePage />)
    
    // Check for gradient background
    const mainDiv = container.querySelector('.bg-gradient-to-br')
    expect(mainDiv).toBeInTheDocument()
  })
})
