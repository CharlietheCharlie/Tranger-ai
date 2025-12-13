
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Dashboard } from '../../../components/Dashboard';
import { Itinerary } from '../../../types';

// Mock mocks
const mockItineraries: Itinerary[] = [
  {
    id: '1',
    name: 'Tokyo Trip',
    destination: 'Tokyo, Japan',
    startDate: '2023-01-01',
    endDate: '2023-01-07',
    days: [],
    collaborators: [],
    comments: [],
    position: 0
  },
  {
    id: '2',
    name: 'Kyoto Trip',
    destination: 'Kyoto, Japan',
    startDate: '2023-02-01',
    endDate: '2023-02-05',
    days: [],
    collaborators: [],
    comments: [],
    position: 1
  }
];

const mockMutateAsync = vi.fn();

// Mock services/itineraryService
vi.mock('../../../services/itineraryService', () => ({
  useItineraries: vi.fn(() => ({
    data: mockItineraries,
    isLoading: false,
    isError: false,
  })),
  useReorderItineraries: vi.fn(() => ({
    mutateAsync: mockMutateAsync,
  })),
}));

// Mock next-auth
vi.mock('next-auth/react', () => ({
  useSession: vi.fn(() => ({
    data: { user: { name: 'Test User' } },
    status: 'authenticated',
  })),
}));

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

// Mock dnd-kit (simplified)
vi.mock('@dnd-kit/core', async () => {
    const actual = await vi.importActual('@dnd-kit/core');
    return {
        ...actual,
        DndContext: ({ children }: any) => <div>{children}</div>,
        DragOverlay: ({ children }: any) => <div>{children}</div>,
        useSensor: vi.fn(),
        useSensors: vi.fn(),
        PointerSensor: vi.fn(),
        KeyboardSensor: vi.fn(),
        closestCenter: vi.fn(),
    };
});

vi.mock('@dnd-kit/sortable', async () => {
    const actual = await vi.importActual('@dnd-kit/sortable');
    return {
        ...actual,
        SortableContext: ({ children }: any) => <div>{children}</div>,
        useSortable: vi.fn(() => ({
            attributes: {},
            listeners: {},
            setNodeRef: vi.fn(),
            transform: null,
            transition: null,
            isDragging: false,
        })),
        sortableKeyboardCoordinates: vi.fn(),
        rectSortingStrategy: vi.fn(),
    };
});

// Mock child components to avoid deep rendering issues and focus on Dashboard logic
vi.mock('../../../components/ItineraryCard', () => ({
    ItineraryCard: ({ itinerary, onClick }: any) => (
        <div data-testid={`itinerary-card-${itinerary.id}`} onClick={() => onClick(itinerary.id)}>
            {itinerary.name}
        </div>
    )
}));

vi.mock('../../../components/DashboardSkeleton', () => ({
    default: () => <div data-testid="dashboard-skeleton">Loading...</div>
}));


describe('Dashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders dashboard with itineraries', () => {
    render(<Dashboard onSelectItinerary={vi.fn()} onNewTrip={vi.fn()} />);

    expect(screen.getByText('myTrips')).toBeDefined();
    expect(screen.getByText('Tokyo Trip')).toBeDefined();
    expect(screen.getByText('Kyoto Trip')).toBeDefined();
  });

  it('filters itineraries based on search term', async () => {
    render(<Dashboard onSelectItinerary={vi.fn()} onNewTrip={vi.fn()} />);

    const searchInput = screen.getByPlaceholderText('searchPlaceholder');
    fireEvent.change(searchInput, { target: { value: 'Kyoto' } });

    expect(screen.queryByText('Tokyo Trip')).toBeNull();
    expect(screen.getByText('Kyoto Trip')).toBeDefined();
  });

  it('calls onNewTrip when new trip button is clicked', () => {
    const onNewTrip = vi.fn();
    render(<Dashboard onSelectItinerary={vi.fn()} onNewTrip={onNewTrip} />);

    // There are two "new trip" buttons. One in header, one in grid.
    // The header one has text "newTrip".
    const buttons = screen.getAllByText('newTrip');
    fireEvent.click(buttons[0]); // Click the first one found (likely the button text)
    // Actually the button contains the text.
    
    expect(onNewTrip).toHaveBeenCalled();
  });

  it('calls onSelectItinerary when an itinerary is clicked', () => {
    const onSelectItinerary = vi.fn();
    render(<Dashboard onSelectItinerary={onSelectItinerary} onNewTrip={vi.fn()} />);

    fireEvent.click(screen.getByTestId('itinerary-card-1'));

    expect(onSelectItinerary).toHaveBeenCalledWith('1');
  });

  // Since we mocked DndContext, testing drag and drop logic is tricky here. 
  // We can test that the DndContext is rendered, but testing the reorder logic 
  // requires simulating drag events which is hard with mocked DndContext.
  // Instead, we might want to test the handleDragEnd logic if we could extract it or trigger it.
  // For now, we assume DndKit works and we tested the integration of components.
  
  // We can test loading state
  it('shows skeleton when loading', async () => {
     const { useItineraries } = await import('../../../services/itineraryService');
     // @ts-ignore
     useItineraries.mockReturnValueOnce({ data: undefined, isLoading: true, isError: false });

     render(<Dashboard onSelectItinerary={vi.fn()} onNewTrip={vi.fn()} />);
     
     expect(screen.getByTestId('dashboard-skeleton')).toBeDefined();
  });
});
