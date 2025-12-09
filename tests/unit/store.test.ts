import { describe, it, expect, beforeEach } from 'vitest';
import { useStore } from '../../services/store';
import { User } from '../../types';

describe('Store: UI State Management', () => {
  beforeEach(() => {
    // Reset store state before each test
    useStore.setState({
      currentItineraryId: '',
      currentUser: null,
    });
  });

  it('should have an initial empty currentItineraryId', () => {
    const { currentItineraryId } = useStore.getState();
    expect(currentItineraryId).toBe('');
  });

  it('should have an initial null currentUser', () => {
    const { currentUser } = useStore.getState();
    expect(currentUser).toBeNull();
  });

  it('should set the current user', () => {
    const { setCurrentUser } = useStore.getState();
    const mockUser: User = { id: 'u1', name: 'Test User', email: 'test@example.com' };
    
    setCurrentUser(mockUser);
    
    const { currentUser } = useStore.getState();
    expect(currentUser).toEqual(mockUser);
  });

  it('should select an itinerary by ID', () => {
    const { selectItinerary } = useStore.getState();
    const testItineraryId = 'itinerary-123';

    selectItinerary(testItineraryId);

    const { currentItineraryId } = useStore.getState();
    expect(currentItineraryId).toBe(testItineraryId);
  });
});