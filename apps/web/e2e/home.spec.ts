import { test, expect } from '@playwright/test'

test.describe('Home Page E2E Tests', () => {
  test('should display home page correctly', async ({ page }) => {
    await page.goto('/')
    
    // Check page title
    await expect(page).toHaveTitle(/TiKiT OS/)
    
    // Check main heading
    await expect(page.getByRole('heading', { name: /TiKiT OS/i })).toBeVisible()
    
    // Check tagline
    await expect(page.getByText(/Campaign Execution & Intelligence Platform/i)).toBeVisible()
    
    // Check description
    await expect(page.getByText(/Enterprise-grade operating system/i)).toBeVisible()
  })

  test('should navigate to dashboard when clicking the button', async ({ page }) => {
    await page.goto('/')
    
    // Find and click the dashboard link
    const dashboardLink = page.getByRole('link', { name: /Go to Dashboard/i })
    await expect(dashboardLink).toBeVisible()
    
    await dashboardLink.click()
    
    // Should navigate to dashboard
    await expect(page).toHaveURL('/dashboard')
    
    // Dashboard should be visible
    await expect(page.getByRole('heading', { name: /Welcome to TiKiT OS Dashboard/i })).toBeVisible()
  })

  test('should have correct styling on home page', async ({ page }) => {
    await page.goto('/')
    
    // Check the main container exists
    const container = page.locator('.min-h-screen')
    await expect(container).toBeVisible()
    
    // Check dashboard link button styling
    const dashboardLink = page.getByRole('link', { name: /Go to Dashboard/i })
    await expect(dashboardLink).toHaveClass(/bg-indigo-600/)
  })
})
