import { render, screen } from '@testing-library/react';
import Timeline from '../Timeline';
import type { TimelineItem } from '../types';

describe('Timeline', () => {
  const mockItems: TimelineItem[] = [
    { id: 1, name: 'Test Item 1', start: '2021-01-01', end: '2021-01-10' },
    { id: 2, name: 'Test Item 2', start: '2021-01-15', end: '2021-01-20' },
  ];

  const mockOnItemUpdate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render timeline with items', () => {
    render(<Timeline items={mockItems} onItemUpdate={mockOnItemUpdate} />);
    
    expect(screen.getByText('Test Item 1')).toBeInTheDocument();
    expect(screen.getByText('Test Item 2')).toBeInTheDocument();
  });

  it('should render zoom controls', () => {
    render(<Timeline items={mockItems} onItemUpdate={mockOnItemUpdate} />);
    
    expect(screen.getByLabelText('Zoom out')).toBeInTheDocument();
    expect(screen.getByLabelText('Zoom in')).toBeInTheDocument();
    expect(screen.getByLabelText('Reset zoom to 100%')).toBeInTheDocument();
  });

  it('should display date range', () => {
    render(<Timeline items={mockItems} onItemUpdate={mockOnItemUpdate} />);
    
    // Date range should be visible
    const dateRange = screen.getByLabelText('Date range');
    expect(dateRange).toBeInTheDocument();
  });

  it('should handle empty items array', () => {
    render(<Timeline items={[]} onItemUpdate={mockOnItemUpdate} />);
    
    // Timeline should still render controls
    expect(screen.getByLabelText('Zoom out')).toBeInTheDocument();
  });

  it('should handle invalid items gracefully', () => {
    const invalidItems = [
      { id: 1, name: 'Valid Item', start: '2021-01-01', end: '2021-01-10' },
      { id: 2, name: '', start: 'invalid', end: '2021-01-10' }, // Invalid item
    ] as TimelineItem[];

    render(<Timeline items={invalidItems} onItemUpdate={mockOnItemUpdate} />);
    
    // Should only render valid items
    expect(screen.getByText('Valid Item')).toBeInTheDocument();
  });

  it('should render timeline items with accessibility attributes', () => {
    render(<Timeline items={mockItems} onItemUpdate={mockOnItemUpdate} />);
    
    const timeline = screen.getByLabelText('Timeline visualization');
    expect(timeline).toBeInTheDocument();
    expect(timeline).toHaveAttribute('role', 'region');
  });
});
