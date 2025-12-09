
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DayColumn } from '@/components/DayColumn';
import { Day, Activity } from '@/types';
import * as activityService from '@/services/activityService';
import { DndContext } from '@dnd-kit/core';
import { NextIntlClientProvider } from 'next-intl';
import React from 'react';

// Mock child components
vi.mock('@/components/ActivityCard', () => ({
  ActivityCard: vi.fn(({ onClick, onDelete }) => (
    <div>
      <button data-testid="activity-click" onClick={onClick}>Activity</button>
      <button data-testid="activity-delete" onClick={onDelete}>Delete</button>
    </div>
  )),
}));

// Mock services
const mockDeleteMutateAsync = vi.fn();
vi.mock('@/services/activityService', async (importOriginal) => {
    const actual = await importOriginal<typeof activityService>();
    return {
        ...actual,
        useDeleteActivity: vi.fn(() => ({ mutateAsync: mockDeleteMutateAsync })),
    };
});


const mockDay: Day = {
  id: 'day1',
  date: '2024-07-27T00:00:00.000Z', // A specific date for consistent formatting
  activities: [
    { id: 'act1', title: 'Morning Yoga' } as Activity,
    { id: 'act2', title: 'Team Lunch' } as Activity,
  ],
};

const mockEmptyDay: Day = {
    id: 'day2',
    date: '2024-07-28T00:00:00.000Z',
    activities: [],
};

const messages = {
    DayColumn: {
        unscheduled: 'Nothing scheduled yet.',
        addEntry: 'Add Entry',
    }
};

const renderWithProviders = (component: React.ReactElement) => {
    return render(
        <NextIntlClientProvider locale="en" messages={messages}>
            <DndContext onDragEnd={() => {}}>{component}</DndContext>
        </NextIntlClientProvider>
    );
}


describe('DayColumn', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should render the formatted date and weekday', () => {
        renderWithProviders(<DayColumn day={mockDay} itineraryId="itin1" />);
        expect(screen.getByText('Jul 27')).not.toBeNull();
        expect(screen.getByText('Saturday')).not.toBeNull();
    });

    it('should display the correct number of activities', () => {
        renderWithProviders(<DayColumn day={mockDay} itineraryId="itin1" />);
        expect(screen.getByText('2')).not.toBeNull(); // Activity count
    });

    it('should render all activity cards', () => {
        renderWithProviders(<DayColumn day={mockDay} itineraryId="itin1" />);
        const activityCards = screen.getAllByTestId('activity-click');
        expect(activityCards).toHaveLength(2);
    });

    it('should show an "unscheduled" message if there are no activities', () => {
        renderWithProviders(<DayColumn day={mockEmptyDay} itineraryId="itin1" />);
        expect(screen.getByText('Nothing scheduled yet.')).not.toBeNull();
    });

    it('should call onAddActivity when the add button is clicked', () => {
        const onAddActivity = vi.fn();
        renderWithProviders(<DayColumn day={mockDay} itineraryId="itin1" onAddActivity={onAddActivity} />);
        
        const addButton = screen.getByText('Add Entry');
        fireEvent.click(addButton);

        expect(onAddActivity).toHaveBeenCalledWith('day1');
    });

    it('should call onActivityClick when an activity card is clicked', () => {
        const onActivityClick = vi.fn();
        renderWithProviders(<DayColumn day={mockDay} itineraryId="itin1" onActivityClick={onActivityClick} />);

        const activityButton = screen.getAllByTestId('activity-click')[0];
        fireEvent.click(activityButton);

        expect(onActivityClick).toHaveBeenCalledWith(mockDay.activities[0], 'day1');
    });

    it('should call the delete mutation when delete is clicked on a card', () => {
        renderWithProviders(<DayColumn day={mockDay} itineraryId="itin1" />);
        
        const deleteButton = screen.getAllByTestId('activity-delete')[0];
        fireEvent.click(deleteButton);

        expect(mockDeleteMutateAsync).toHaveBeenCalledWith({
            itineraryId: 'itin1',
            activityId: 'act1',
        });
    });
});
