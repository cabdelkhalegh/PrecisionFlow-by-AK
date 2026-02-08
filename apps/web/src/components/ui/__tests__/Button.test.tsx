import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '../Button';

describe('Button Component', () => {
  it('renders with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('handles click events', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    const button = screen.getByText('Click me');
    fireEvent.click(button);
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('respects disabled state', () => {
    const handleClick = vi.fn();
    render(
      <Button disabled onClick={handleClick}>
        Disabled
      </Button>
    );
    
    const button = screen.getByText('Disabled');
    fireEvent.click(button);
    
    expect(handleClick).not.toHaveBeenCalled();
    expect(button).toBeDisabled();
  });

  it('renders all variants correctly', () => {
    const variants: Array<'primary' | 'secondary' | 'danger' | 'ghost'> = ['primary', 'secondary', 'danger', 'ghost'];
    
    variants.forEach((variant) => {
      const { container, unmount } = render(<Button variant={variant}>Test</Button>);
      const button = screen.getByText('Test');
      expect(button).toBeInTheDocument();
      unmount();
    });
  });

  it('shows loading state', () => {
    render(<Button loading>Loading</Button>);
    const button = screen.getByText('Loading').closest('button');
    expect(button).toBeDisabled();
  });

  it('renders different sizes', () => {
    const sizes: Array<'sm' | 'md' | 'lg'> = ['sm', 'md', 'lg'];
    
    sizes.forEach((size) => {
      const { unmount } = render(<Button size={size}>Test</Button>);
      expect(screen.getByText('Test')).toBeInTheDocument();
      unmount();
    });
  });
});
