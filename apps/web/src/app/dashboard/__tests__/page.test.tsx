import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import DashboardPage from '../page'

describe('DashboardPage', () => {
  it('renders the dashboard header with TiKiT OS title', () => {
    render(<DashboardPage />)
    
    const heading = screen.getByRole('heading', { name: /TiKiT OS/i, level: 1 })
    expect(heading).toBeInTheDocument()
  })

  it('displays the welcome message', () => {
    render(<DashboardPage />)
    
    const welcomeHeading = screen.getByRole('heading', { 
      name: /Welcome to TiKiT OS Dashboard/i,
      level: 2 
    })
    expect(welcomeHeading).toBeInTheDocument()
    
    const description = screen.getByText(/Campaign Execution & Intelligence Platform - Successfully Running/i)
    expect(description).toBeInTheDocument()
  })

  it('displays all four stat cards', () => {
    render(<DashboardPage />)
    
    // Check for stat card titles
    expect(screen.getByText('Active Campaigns')).toBeInTheDocument()
    expect(screen.getByText('Pending Approvals')).toBeInTheDocument()
    expect(screen.getByText('Active Creators')).toBeInTheDocument()
    expect(screen.getByText('Total Budget')).toBeInTheDocument()
  })

  it('displays quick action buttons', () => {
    render(<DashboardPage />)
    
    const newCampaignButton = screen.getByRole('button', { name: /New Campaign/i })
    const reviewBriefsButton = screen.getByRole('button', { name: /Review Briefs/i })
    const contentTasksButton = screen.getByRole('button', { name: /Content Tasks/i })
    
    expect(newCampaignButton).toBeInTheDocument()
    expect(reviewBriefsButton).toBeInTheDocument()
    expect(contentTasksButton).toBeInTheDocument()
  })

  it('displays system status section', () => {
    render(<DashboardPage />)
    
    const systemStatusHeading = screen.getByRole('heading', { 
      name: /System Status/i,
      level: 3 
    })
    expect(systemStatusHeading).toBeInTheDocument()
    
    // Check for status items
    expect(screen.getByText('Web Application')).toBeInTheDocument()
    expect(screen.getByText('Database Connection')).toBeInTheDocument()
    expect(screen.getByText('AI Services')).toBeInTheDocument()
    expect(screen.getByText('Authentication')).toBeInTheDocument()
  })

  it('displays campaign manager role', () => {
    render(<DashboardPage />)
    
    const roleText = screen.getByText('Campaign Manager')
    expect(roleText).toBeInTheDocument()
  })

  it('shows correct initial stat values', () => {
    render(<DashboardPage />)
    
    // All stats should show "0" except budget which shows "$0"
    const zeroValues = screen.getAllByText('0')
    expect(zeroValues.length).toBeGreaterThanOrEqual(3)
    
    expect(screen.getByText('$0')).toBeInTheDocument()
  })
})
