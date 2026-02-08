import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Input } from '../Input';

describe('Input Component', () => {
  it('renders with label', () => {
    render(<Input label="Email" type="email" />);
    expect(screen.getByText('Email')).toBeInTheDocument();
  });

  it('accepts user input', () => {
    render(<Input label="Name" type="text" />);
    
    const input = screen.getByLabelText('Name') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'John Doe' } });
    
    expect(input.value).toBe('John Doe');
  });

  it('shows error message', () => {
    render(<Input label="Email" type="email" error="Invalid email" />);
    expect(screen.getByText('Invalid email')).toBeInTheDocument();
  });

  it('calls onChange handler', () => {
    const handleChange = vi.fn();
    render(<Input label="Name" type="text" onChange={handleChange} />);
    
    const input = screen.getByLabelText('Name');
    fireEvent.change(input, { target: { value: 'Test' } });
    
    expect(handleChange).toHaveBeenCalled();
  });
});
