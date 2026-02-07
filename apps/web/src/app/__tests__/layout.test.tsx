import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import RootLayout, { metadata } from '../layout'

describe('RootLayout', () => {
  it('renders children correctly', () => {
    const { getByTestId } = render(
      <RootLayout>
        <div data-testid="test-child">Test Content</div>
      </RootLayout>
    )

    expect(getByTestId('test-child')).toBeInTheDocument()
    expect(getByTestId('test-child')).toHaveTextContent('Test Content')
  })

  it('wraps children in proper structure', () => {
    const { container } = render(
      <RootLayout>
        <div data-testid="test-child">Test Content</div>
      </RootLayout>
    )

    // Check that children are rendered
    expect(container.querySelector('[data-testid="test-child"]')).toBeInTheDocument()
  })

  it('has correct metadata title', () => {
    expect(metadata).toBeDefined()
    expect(metadata.title).toBe('TiKiT OS - Campaign Execution & Intelligence')
  })

  it('has correct metadata description', () => {
    expect(metadata).toBeDefined()
    expect(metadata.description).toBe('Enterprise-grade operating system for influencer marketing agencies')
  })

  it('renders multiple children correctly', () => {
    const { getByTestId } = render(
      <RootLayout>
        <div data-testid="child-1">First</div>
        <div data-testid="child-2">Second</div>
      </RootLayout>
    )

    expect(getByTestId('child-1')).toBeInTheDocument()
    expect(getByTestId('child-2')).toBeInTheDocument()
  })
})
