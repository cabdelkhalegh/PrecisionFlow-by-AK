import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Card } from '../Card';

describe('Card Component', () => {
  it('renders children correctly', () => {
    render(
      <Card>
        <div>Card Content</div>
      </Card>
    );
    
    expect(screen.getByText('Card Content')).toBeInTheDocument();
  });

  it('applies correct styling classes', () => {
    const { container } = render(
      <Card>
        <div>Content</div>
      </Card>
    );
    
    const card = container.firstChild as HTMLElement;
    expect(card.className).toContain('rounded');
  });
});
