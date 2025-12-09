import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ItineraryBoard } from '@/components/ItineraryBoard';
import { Itinerary, Day, Activity } from '@/types';
import * as activityService from '@/services/activityService';
import React from 'react';

// Mock child components
vi.mock('@/components/DayColumn', () => ({
  DayColumn: vi.fn(({ day, onAddActivity }) => (
    <div data-testid={`day-column-${day.id}`}>
      <button onClick={() => onAddActivity(day.id)}>Add Activity to {day.id}</button>
    </div>
  )),
}));

vi.mock('@/components/ActivityCard', () => ({
    ActivityCard: vi.fn(() => <div data-testid="activity-card" />),
}));
  

// Mock services
const mockMutateAsync = vi.fn();
vi.mock('@/services/activityService', async (importOriginal) => {
    const actual = await importOriginal<typeof activityService>();
    return {
        ...actual,
        useReorderDays: vi.fn(() => ({ mutateAsync: mockMutateAsync, isPending: false })),
        useMoveActivity: vi.fn(() => ({ mutateAsync: mockMutateAsync, isPending: false })),
        useReorderActivities: vi.fn(() => ({ mutateAsync: mockMutateAsync, isPending: false })),
    };
});

const mockItinerary: Itinerary = {
  id: 'itin1',
  name: 'Test Trip',
  startDate: '2024-01-01',
  endDate: '2024-01-03',
  days: [
    { id: 'day1', date: '2024-01-01', activities: [{ id: 'act1', title: 'Activity 1' } as Activity] },
    { id: 'day2', date: '2024-01-02', activities: [] },
  ] as Day[],
} as Itinerary;


describe('ItineraryBoard', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

  it('should render the correct number of DayColumn components', () => {
    render(
        <ItineraryBoard itinerary={mockItinerary} isFetching={false} />
    );

    const dayColumns = screen.getAllByTestId(/day-column-/);
    expect(dayColumns).toHaveLength(2);
    expect(screen.getByTestId('day-column-day1')).not.toBeNull();
    expect(screen.getByTestId('day-column-day2')).not.toBeNull();
  });

  it('should show a loading overlay when isFetching is true', () => {
    // The loader icon has role='img' and no accessible name by default
    // We will look for the container div.
    render(
        <ItineraryBoard itinerary={mockItinerary} isFetching={true} />
    );
    const loaderContainer = screen.getByTestId('loader');
    expect(loaderContainer).not.toBeNull();
  });

  it('should show a loading overlay when a mutation is pending', () => {
    vi.mocked(activityService.useReorderDays).mockReturnValue({
        mutateAsync: mockMutateAsync,
        isPending: true,
    });
    
    render(
        <ItineraryBoard itinerary={mockItinerary} isFetching={false} />
    );
    
    const loaderContainer = screen.getByTestId('loader');
    expect(loaderContainer).not.toBeNull();
  });

  it('should call onActivityClick with null when add activity is clicked', () => {
    const onActivityClick = vi.fn();
    render(
        <ItineraryBoard itinerary={mockItinerary} isFetching={false} onActivityClick={onActivityClick} />
    );
    
    const addButton = screen.getByText('Add Activity to day1');
    fireEvent.click(addButton);

    expect(onActivityClick).toHaveBeenCalledWith(null, 'day1');
  });
});