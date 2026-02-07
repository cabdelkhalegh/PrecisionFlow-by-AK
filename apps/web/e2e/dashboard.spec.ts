import { test, expect } from '@playwright/test'

test.describe('Dashboard E2E Tests', () => {
  test('should display dashboard page correctly', async ({ page }) => {
    await page.goto('/dashboard')
    
    // Check page title
    await expect(page).toHaveTitle(/TiKiT OS/)
    
    // Check main heading
    await expect(page.getByRole('heading', { name: /TiKiT OS/i, level: 1 })).toBeVisible()
    
    // Check welcome message
    await expect(page.getByRole('heading', { name: /Welcome to TiKiT OS Dashboard/i })).toBeVisible()
  })

  test('should display all stat cards', async ({ page }) => {
    await page.goto('/dashboard')
    
    // Check for all four stat cards
    await expect(page.getByText('Active Campaigns')).toBeVisible()
    await expect(page.getByText('Pending Approvals')).toBeVisible()
    await expect(page.getByText('Active Creators')).toBeVisible()
    await expect(page.getByText('Total Budget')).toBeVisible()
  })

  test('should display quick action buttons', async ({ page }) => {
    await page.goto('/dashboard')
    
    // Check for action buttons
    const newCampaignBtn = page.getByRole('button', { name: /New Campaign/i })
    const reviewBriefsBtn = page.getByRole('button', { name: /Review Briefs/i })
    const contentTasksBtn = page.getByRole('button', { name: /Content Tasks/i })
    
    await expect(newCampaignBtn).toBeVisible()
    await expect(reviewBriefsBtn).toBeVisible()
    await expect(contentTasksBtn).toBeVisible()
  })

  test('should display system status', async ({ page }) => {
    await page.goto('/dashboard')
    
    // Check system status section
    await expect(page.getByRole('heading', { name: /System Status/i })).toBeVisible()
    
    // Check status items
    await expect(page.getByText('Web Application')).toBeVisible()
    await expect(page.getByText('Database Connection')).toBeVisible()
    await expect(page.getByText('AI Services')).toBeVisible()
    await expect(page.getByText('Authentication')).toBeVisible()
  })

  test('should have responsive layout', async ({ page }) => {
    await page.goto('/dashboard')
    
    // Check the page renders without layout issues
    const main = page.locator('main')
    await expect(main).toBeVisible()
    
    // Check header exists
    const header = page.locator('header')
    await expect(header).toBeVisible()
  })
})
