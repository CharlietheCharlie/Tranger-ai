
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ItineraryCard } from '../../../components/ItineraryCard';
import { Itinerary } from '../../../types';

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

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string, values?: any) => {
    if (key === 'days') return `${values.count} days`;
    return key;
  },
}));

describe('ItineraryCard', () => {
  const mockItinerary: Itinerary = {
    id: 'trip-1',
    name: 'Paris Trip',
    destination: 'Paris, France',
    startDate: '2023-05-01',
    endDate: '2023-05-05',
    coverImage: 'https://example.com/paris.jpg',
    days: [
        { id: 'd1', date: '2023-05-01', activities: [] },
        { id: 'd2', date: '2023-05-02', activities: [] }
    ],
    collaborators: [
        { userId: 'u1', itineraryId: 'trip-1', user: { id: 'u1', name: 'Alice', image: 'alice.jpg' } },
        { userId: 'u2', itineraryId: 'trip-1', user: { id: 'u2', name: 'Bob', image: 'bob.jpg' } }
    ],
    comments: [],
    position: 0
  };

  it('renders itinerary details correctly', () => {
    render(<ItineraryCard itinerary={mockItinerary} onClick={vi.fn()} />);

    expect(screen.getByText('Paris Trip')).toBeDefined();
    expect(screen.getByText('Paris, France')).toBeDefined();
    expect(screen.getByText('2 days')).toBeDefined(); // From mocked translation
    expect(screen.getByRole('img', { name: 'Paris, France' }).getAttribute('src')).toBe('https://example.com/paris.jpg');
  });

  it('renders default cover image if not provided', () => {
    const itineraryWithoutImage = { ...mockItinerary, coverImage: undefined };
    render(<ItineraryCard itinerary={itineraryWithoutImage} onClick={vi.fn()} />);

    const img = screen.getByRole('img', { name: 'Paris, France' });
    expect(img.getAttribute('src')).toContain('unsplash');
  });

  it('calls onClick with itinerary id when clicked', () => {
    const onClick = vi.fn();
    render(<ItineraryCard itinerary={mockItinerary} onClick={onClick} />);

    // The main container has the onClick.
    // We can click the title or just the main wrapper.
    fireEvent.click(screen.getByText('Paris Trip'));

    expect(onClick).toHaveBeenCalledWith('trip-1');
  });

  it('renders collaborators avatars', () => {
    render(<ItineraryCard itinerary={mockItinerary} onClick={vi.fn()} />);
    
    // There should be 2 collaborator images
    // Note: The main cover image is also an img.
    // Collaborator images have src 'alice.jpg' and 'bob.jpg'
    const images = screen.getAllByRole('img');
    const collaboratorImages = images.filter(img => 
        img.getAttribute('src') === 'alice.jpg' || img.getAttribute('src') === 'bob.jpg'
    );
    expect(collaboratorImages).toHaveLength(2);
  });
});
