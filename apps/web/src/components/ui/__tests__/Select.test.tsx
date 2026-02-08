import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Select } from '../Select';

describe('Select Component', () => {
  it('renders with options', () => {
    render(
      <Select label="Status">
        <option value="draft">Draft</option>
        <option value="active">Active</option>
      </Select>
    );
    
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Draft')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('calls onChange handler', () => {
    const handleChange = vi.fn();
    render(
      <Select label="Status" onChange={handleChange}>
        <option value="draft">Draft</option>
        <option value="active">Active</option>
      </Select>
    );
    
    const select = screen.getByLabelText('Status');
    fireEvent.change(select, { target: { value: 'active' } });
    
    expect(handleChange).toHaveBeenCalled();
  });
});
