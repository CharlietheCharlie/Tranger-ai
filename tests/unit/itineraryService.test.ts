import { describe, it, expect, vi, beforeEach, afterEach, Mock } from 'vitest';
import * as clientUtils from '../../lib/client-utils';
import { Itinerary } from '../../types';
import {
  fetchItineraries,
  fetchItineraryById,
  createItinerary,
  updateItinerary,
  deleteItinerary,
  reorderItineraries,
} from '../../services/itineraryService';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock client-utils
vi.mock('../../lib/client-utils', () => ({
  getTempUserId: vi.fn(),
}));

const mockItinerary: Itinerary = {
  id: '1',
  name: 'Test Itinerary',
  startDate: '2024-01-01',
  endDate: '2024-01-03',
  destination: 'Test City',
  days: [],
  collaborators: [],
  comments: [],
};

describe('Itinerary Service', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    (clientUtils.getTempUserId as Mock).mockReturnValue('temp-user-123');
  });

  describe('fetchItineraries', () => {
    it('should fetch itineraries with the correct headers', async () => {
      const mockData = [mockItinerary];
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockData,
      });

      const result = await fetchItineraries();

      expect(mockFetch).toHaveBeenCalledWith('/api/itineraries', {
        headers: { 'x-temp-user-id': 'temp-user-123' },
      });
      expect(result).toEqual(mockData);
    });

    it('should throw an error if the fetch fails', async () => {
      mockFetch.mockResolvedValue({ ok: false });
      await expect(fetchItineraries()).rejects.toThrow('Failed to fetch itineraries');
    });
  });

  describe('fetchItineraryById', () => {
    it('should fetch an itinerary by id with correct headers', async () => {
      const mockData = mockItinerary;
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockData,
      });

      const result = await fetchItineraryById('1');

      expect(mockFetch).toHaveBeenCalledWith('/api/itineraries/1', {
        headers: { 'x-temp-user-id': 'temp-user-123' },
      });
      expect(result).toEqual(mockData);
    });

    it('should throw an error if the fetch fails', async () => {
        mockFetch.mockResolvedValue({ ok: false });
        await expect(fetchItineraryById('1')).rejects.toThrow('Failed to fetch itinerary');
      });
  });

  describe('createItinerary', () => {
    it('should post a new itinerary with correct headers and body', async () => {
        const newItineraryData = { ...mockItinerary };
        delete (newItineraryData as Partial<Itinerary>).id; // Omit id for creation

        mockFetch.mockResolvedValue({
            ok: true,
            json: async () => mockItinerary,
        });

        const result = await createItinerary(newItineraryData);

        expect(mockFetch).toHaveBeenCalledWith('/api/itineraries', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-temp-user-id': 'temp-user-123',
            },
            body: JSON.stringify(newItineraryData),
        });
        expect(result).toEqual(mockItinerary);
    });

    it('should throw an error if the creation fails', async () => {
        const newItineraryData = { ...mockItinerary };
        delete (newItineraryData as Partial<Itinerary>).id;
        mockFetch.mockResolvedValue({ ok: false });
        await expect(createItinerary(newItineraryData)).rejects.toThrow('Failed to create itinerary');
    });
  });

  describe('updateItinerary', () => {
    it('should patch an itinerary with the correct headers and body', async () => {
      const updates = { name: 'Updated Name' };
      const updatedItinerary = { ...mockItinerary, ...updates };
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => updatedItinerary,
      });

      const result = await updateItinerary({ id: '1', updates });

      expect(mockFetch).toHaveBeenCalledWith('/api/itineraries/1', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-temp-user-id': 'temp-user-123',
        },
        body: JSON.stringify(updates),
      });
      expect(result).toEqual(updatedItinerary);
    });

    it('should throw an error if the update fails', async () => {
        mockFetch.mockResolvedValue({ ok: false });
        await expect(updateItinerary({ id: '1', updates: {} })).rejects.toThrow('Failed to update itinerary');
    });
  });

  describe('deleteItinerary', () => {
    it('should send a delete request with correct headers', async () => {
        mockFetch.mockResolvedValue({ ok: true });
        await deleteItinerary('1');
        expect(mockFetch).toHaveBeenCalledWith('/api/itineraries/1', {
            method: 'DELETE',
            headers: { 'x-temp-user-id': 'temp-user-123' },
        });
    });

    it('should throw an error if deletion fails', async () => {
        mockFetch.mockResolvedValue({ ok: false });
        await expect(deleteItinerary('1')).rejects.toThrow('Failed to delete itinerary');
    });
  });

  describe('reorderItineraries', () => {
    it('should send a patch request to reorder with correct headers and body', async () => {
        const orderedIds = ['2', '1', '3'];
        mockFetch.mockResolvedValue({ ok: true });

        await reorderItineraries(orderedIds);

        expect(mockFetch).toHaveBeenCalledWith('/api/itineraries/reorder', {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'x-temp-user-id': 'temp-user-123',
            },
            body: JSON.stringify({ orderedItineraryIds: orderedIds }),
        });
    });

    it('should throw an error if reordering fails', async () => {
        mockFetch.mockResolvedValue({ ok: false });
        await expect(reorderItineraries([])).rejects.toThrow('Failed to reorder itineraries');
    });
  });
});