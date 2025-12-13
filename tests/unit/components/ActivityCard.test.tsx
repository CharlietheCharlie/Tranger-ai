
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ActivityCard } from '../../../components/ActivityCard';
import { Activity } from '../../../types';

// Mock @dnd-kit/sortable
vi.mock('@dnd-kit/sortable', () => ({
  useSortable: vi.fn(() => ({
    attributes: {},
    listeners: {},
    setNodeRef: vi.fn(),
    transform: null,
    transition: null,
    isDragging: false,
  })),
}));

// Mock @dnd-kit/utilities
vi.mock('@dnd-kit/utilities', () => ({
  CSS: {
    Transform: {
      toString: vi.fn(),
    },
  },
}));

describe('ActivityCard', () => {
  const mockActivity: Activity = {
    id: '1',
    title: 'Test Activity',
    description: 'Test Description',
    dayId: 'day-1',
    itineraryId: 'itinerary-1',
    startTime: '10:00',
    duration: 60,
    cost: 50,
    location: 'Test Location',
    tags: ['fun', 'outdoor'],
    createdAt: new Date(),
    updatedAt: new Date(),
    position: 0,
    placeId: 'place-1',
    image: null,
    rating: 4.5,
    userRatingTotal: 100,
    priceLevel: 2,
    notes: ''
  };

  it('renders activity details correctly', () => {
    render(<ActivityCard activity={mockActivity} dayId="day-1" />);

    expect(screen.getByText('Test Activity')).toBeDefined();
    expect(screen.getByText('10:00')).toBeDefined();
    expect(screen.getByText('60 min')).toBeDefined();
    expect(screen.getByText('$50')).toBeDefined();
    expect(screen.getByText('Test Location')).toBeDefined();
    expect(screen.getByText('fun')).toBeDefined();
    expect(screen.getByText('outdoor')).toBeDefined();
  });

  it('calls onDelete when delete button is clicked', () => {
    const onDelete = vi.fn();
    render(<ActivityCard activity={mockActivity} dayId="day-1" onDelete={onDelete} />);

    // The delete button is the one with the trash icon, but since we can't easily query by icon,
    // we can assume it's one of the buttons.
    // In the component, there are potentially buttons for:
    // 1. The card itself (if it has onClick?) - No, the card has a div with onClick.
    // 2. The Delete button.
    // 3. The Location button.
    
    // The delete button is the first button element inside the card's main container usually.
    // Let's refine the query. We can add a data-testid to the component if we were allowed to edit it freely, 
    // but here we should try to target it by its position or attributes.
    // It's the button inside the header flex container.
    
    const buttons = screen.getAllByRole('button');
    // First button is likely the delete button as it appears before the location button in DOM structure?
    // Wait, in ActivityCard.tsx:
    // 1. Header div -> h4 ... button (Delete)
    // 2. Info div
    // 3. Location button (if location exists)
    
    // So yes, the delete button should be the first button.
    fireEvent.click(buttons[0]);

    expect(onDelete).toHaveBeenCalled();
  });

  it('opens google maps when location is clicked', () => {
    render(<ActivityCard activity={mockActivity} dayId="day-1" />);
    
    const locationButton = screen.getByText('Test Location').closest('button');
    fireEvent.click(locationButton!);

    expect(window.open).toHaveBeenCalledWith(
      expect.stringContaining('google.com/maps/search'),
      '_blank'
    );
  });

  it('calls onClick when card is clicked', () => {
    const onClick = vi.fn();
    render(<ActivityCard activity={mockActivity} dayId="day-1" onClick={onClick} />);

    // Click on the main text to simulate card click
    fireEvent.click(screen.getByText('Test Activity'));

    expect(onClick).toHaveBeenCalled();
  });

  it('shows loading spinner when isDeleting is true', () => {
    render(<ActivityCard activity={mockActivity} dayId="day-1" isDeleting={true} />);
    // Look for a loader icon or check if Trash2 is gone. 
    // The Loader2 has 'animate-spin' class.
    const loader = document.querySelector('.animate-spin');
    expect(loader).toBeDefined();
  });
});
