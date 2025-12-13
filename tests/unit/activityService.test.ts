
import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as clientUtils from '@/lib/client-utils';
import { Activity } from '@/types';
import {
  addActivity,
  updateActivity,
  moveActivity,
  deleteActivity,
  reorderDays,
  reorderActivities,
} from '@/services/activityService';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock client-utils
vi.mock('@/lib/client-utils', () => ({
  getTempUserId: vi.fn(),
}));

const mockActivity: Activity = {
  id: 'act1',
  title: 'Test Activity',
  startTime: '10:00',
  description: 'A test activity',
  cost: 0,
  tags: [],
  position: 0,
  dayId: 'day1',
};

describe('Activity Service', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    (clientUtils.getTempUserId as vi.Mock).mockReturnValue('temp-user-123');
  });

  describe('addActivity', () => {
    it('should add an activity and return it', async () => {
      const data = {
        itineraryId: 'itin1',
        dayId: 'day1',
        activity: { ...mockActivity },
      };
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockActivity,
      });

      const result = await addActivity(data);

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/itineraries/itin1/days/day1/activities',
        expect.objectContaining({ method: 'POST', body: JSON.stringify(data.activity) })
      );
      expect(result).toEqual(mockActivity);
    });

    it('should throw an error on failure', async () => {
        mockFetch.mockResolvedValue({ ok: false });
        await expect(addActivity({} as any)).rejects.toThrow('Failed to add activity');
    });
  });

  describe('updateActivity', () => {
    it('should update an activity', async () => {
      const updates = { title: 'New Title' };
      const data = { itineraryId: 'itin1', activityId: 'act1', updates };
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ ...mockActivity, ...updates }),
      });

      const result = await updateActivity(data);

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/activities/act1',
        expect.objectContaining({ method: 'PATCH', body: JSON.stringify(updates) })
      );
      expect(result.title).toBe('New Title');
    });

    it('should throw an error on failure', async () => {
        mockFetch.mockResolvedValue({ ok: false });
        await expect(updateActivity({} as any)).rejects.toThrow('Failed to update activity');
    });
  });

  describe('moveActivity', () => {
    it('should move an activity', async () => {
        const data = { itineraryId: 'itin1', activityId: 'act1', targetDayId: 'day2', position: 1 };
        mockFetch.mockResolvedValue({ ok: true, json: async () => ({}) });

        await moveActivity(data);

        expect(mockFetch).toHaveBeenCalledWith(
            '/api/activities/act1/move',
            expect.objectContaining({ method: 'POST', body: JSON.stringify({ targetDayId: 'day2', position: 1 }) })
        );
    });

    it('should throw an error on failure', async () => {
        mockFetch.mockResolvedValue({ ok: false });
        await expect(moveActivity({} as any)).rejects.toThrow('Failed to move activity');
    });
  });

  describe('deleteActivity', () => {
    it('should delete an activity', async () => {
        mockFetch.mockResolvedValue({ ok: true });
        await deleteActivity({ activityId: 'act1' });
        expect(mockFetch).toHaveBeenCalledWith('/api/activities/act1', { method: 'DELETE' });
    });

    it('should throw an error on failure', async () => {
        mockFetch.mockResolvedValue({ ok: false });
        await expect(deleteActivity({ activityId: 'act1' })).rejects.toThrow('Failed to delete activity');
    });
  });

  describe('reorderDays', () => {
    it('should reorder days', async () => {
        const data = { itineraryId: 'itin1', orderedDayIds: ['day2', 'day1'] };
        mockFetch.mockResolvedValue({ ok: true });

        await reorderDays(data);

        expect(mockFetch).toHaveBeenCalledWith(
            '/api/itineraries/itin1/days',
            expect.objectContaining({ method: 'PATCH', body: JSON.stringify({ orderedDayIds: data.orderedDayIds }) })
        );
    });

    it('should throw an error on failure', async () => {
        mockFetch.mockResolvedValue({ ok: false });
        await expect(reorderDays({} as any)).rejects.toThrow('Failed to reorder days');
    });
  });

  describe('reorderActivities', () => {
    it('should reorder activities', async () => {
        const data = { itineraryId: 'itin1', dayId: 'day1', orderedActivityIds: ['act2', 'act1'] };
        mockFetch.mockResolvedValue({ ok: true });

        await reorderActivities(data);

        expect(mockFetch).toHaveBeenCalledWith(
            '/api/itineraries/itin1/days/day1/activities/reorder',
            expect.objectContaining({ method: 'PATCH', body: JSON.stringify({ activityIds: data.orderedActivityIds }) })
        );
    });

    it('should throw an error on failure', async () => {
        mockFetch.mockResolvedValue({ ok: false });
        await expect(reorderActivities({} as any)).rejects.toThrow('Failed to reorder activities');
    });
  });
});
