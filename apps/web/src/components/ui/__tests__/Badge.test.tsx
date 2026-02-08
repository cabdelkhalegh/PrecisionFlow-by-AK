import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Badge } from '../Badge';

describe('Badge Component', () => {
  it('renders text correctly', () => {
    render(<Badge>Active</Badge>);
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('renders all variants', () => {
    const variants: Array<'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info'> = [
      'default',
      'primary',
      'success',
      'warning',
      'danger',
      'info',
    ];
    
    variants.forEach((variant) => {
      const { unmount } = render(<Badge variant={variant}>Test</Badge>);
      expect(screen.getByText('Test')).toBeInTheDocument();
      unmount();
    });
  });

  it('applies variant-specific classes', () => {
    const { container } = render(<Badge variant="success">Success</Badge>);
    const badge = screen.getByText('Success');
    expect(badge.className).toContain('bg');
  });
});
