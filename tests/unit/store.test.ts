
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useStore } from '../../services/store';

// Mock UUID
vi.mock('uuid', () => ({
  v4: () => 'test-uuid-' + Math.random().toString(36).substr(2, 9),
}));

describe('Store: Business Logic', () => {
  beforeEach(() => {
    // Reset store state
    useStore.setState({
      itineraries: [],
      currentItineraryId: null,
      currentUser: { id: 'u1', name: 'Test User', avatar: '', color: '', isOnline: true },
      collaborators: []
    });
  });

  describe('Itinerary Management', () => {
    it('should create an itinerary with correct days', () => {
      const { createItinerary } = useStore.getState();
      const id = createItinerary('Tokyo Trip', 'Tokyo', '2024-01-01', 3);
      
      const state = useStore.getState();
      const trip = state.itineraries.find(i => i.id === id);

      expect(trip).toBeDefined();
      expect(trip?.name).toBe('Tokyo Trip');
      expect(trip?.days).toHaveLength(3);
      expect(trip?.days[0].date).toBe('2024-01-01');
      expect(trip?.days[2].date).toBe('2024-01-03');
    });

    it('should update itinerary details and shift day dates', () => {
      const { createItinerary, updateItinerary } = useStore.getState();
      const id = createItinerary('Initial', 'Loc', '2024-01-01', 2);
      
      // Update Name and Start Date (Shift by 1 day)
      updateItinerary(id, { name: 'Updated', startDate: '2024-01-02' });
      
      const trip = useStore.getState().itineraries.find(i => i.id === id);
      expect(trip?.name).toBe('Updated');
      expect(trip?.startDate).toBe('2024-01-02');
      expect(trip?.days[0].date).toBe('2024-01-02');
      expect(trip?.days[1].date).toBe('2024-01-03');
    });

    it('should delete an itinerary', () => {
      const { createItinerary, deleteItinerary, selectItinerary } = useStore.getState();
      const id = createItinerary('To Delete', 'Loc', '2024-01-01', 1);
      selectItinerary(id);

      deleteItinerary(id);
      
      const state = useStore.getState();
      expect(state.itineraries).toHaveLength(0);
      expect(state.currentItineraryId).toBeNull();
    });
  });

  describe('Activity Management', () => {
    let tripId: string;
    let day1Id: string;
    let day2Id: string;

    beforeEach(() => {
        const { createItinerary } = useStore.getState();
        tripId = createItinerary('Activity Test', 'Loc', '2024-01-01', 2);
        const trip = useStore.getState().itineraries[0];
        day1Id = trip.days[0].id;
        day2Id = trip.days[1].id;
    });

    it('should add activity', () => {
      const { addActivity } = useStore.getState();
      const actId = addActivity(tripId, day1Id, { title: 'Lunch', tags: [] });

      const trip = useStore.getState().itineraries[0];
      const day = trip.days.find(d => d.id === day1Id);
      
      expect(day?.activities).toHaveLength(1);
      expect(day?.activities[0].id).toBe(actId);
      expect(day?.activities[0].title).toBe('Lunch');
    });

    it('should update activity', () => {
      const { addActivity, updateActivity } = useStore.getState();
      const actId = addActivity(tripId, day1Id, { title: 'Lunch', tags: [] });

      updateActivity(tripId, day1Id, actId, { title: 'Dinner', cost: 50 });

      const trip = useStore.getState().itineraries[0];
      const act = trip.days[0].activities[0];
      
      expect(act.title).toBe('Dinner');
      expect(act.cost).toBe(50);
    });

    it('should move activity between days', () => {
      const { addActivity, moveActivity } = useStore.getState();
      const actId = addActivity(tripId, day1Id, { title: 'Move Me', tags: [] });

      // Move from Day 1 to Day 2
      moveActivity(tripId, actId, day1Id, day2Id, 0);

      const trip = useStore.getState().itineraries[0];
      const day1 = trip.days.find(d => d.id === day1Id);
      const day2 = trip.days.find(d => d.id === day2Id);

      expect(day1?.activities).toHaveLength(0);
      expect(day2?.activities).toHaveLength(1);
      expect(day2?.activities[0].title).toBe('Move Me');
    });

    it('should reorder activity within same day', () => {
        const { addActivity, moveActivity } = useStore.getState();
        const a1 = addActivity(tripId, day1Id, { title: 'A1', tags: [] });
        const a2 = addActivity(tripId, day1Id, { title: 'A2', tags: [] });
  
        // Move A2 to index 0 (before A1)
        moveActivity(tripId, a2, day1Id, day1Id, 0);
  
        const trip = useStore.getState().itineraries[0];
        const acts = trip.days[0].activities;
  
        expect(acts[0].title).toBe('A2');
        expect(acts[1].title).toBe('A1');
      });
  });

  describe('Collaboration', () => {
    it('should add comment', () => {
        const { createItinerary, addComment } = useStore.getState();
        const id = createItinerary('Collab', 'Loc', '2024-01-01', 1);
        
        addComment(id, 'Hello World');
        
        const trip = useStore.getState().itineraries[0];
        expect(trip.comments).toHaveLength(1);
        expect(trip.comments[0].text).toBe('Hello World');
    });

    it('should add collaborator', () => {
        const { createItinerary, addCollaborator } = useStore.getState();
        const id = createItinerary('Collab', 'Loc', '2024-01-01', 1);
        
        addCollaborator(id, 'test@test.com');
        
        const trip = useStore.getState().itineraries[0];
        // 1 owner + 1 added
        expect(trip.collaborators).toHaveLength(2);
        expect(trip.collaborators[1].name).toBe('test');
    });
  });
});
