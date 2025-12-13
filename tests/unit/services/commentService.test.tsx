
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useAddComment, useItineraryComments, useCreateInvite } from '../../../services/commentService';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

// Mock client-utils
vi.mock('@/lib/client-utils', () => ({
  getTempUserId: vi.fn(() => 'temp-user-123'),
}));

// Mock fetch
const globalFetch = vi.fn();
global.fetch = globalFetch;

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('commentService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useAddComment', () => {
    it('calls add comment api successfully', async () => {
      globalFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 'c1', text: 'test comment' }),
      });

      const { result } = renderHook(() => useAddComment(), { wrapper: createWrapper() });

      await result.current.mutateAsync({
        itineraryId: 'trip-1',
        text: 'test comment',
      });

      expect(globalFetch).toHaveBeenCalledWith('/api/comments', expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          'x-temp-user-id': 'temp-user-123',
        }),
        body: JSON.stringify({
          itineraryId: 'trip-1',
          text: 'test comment',
        }),
      }));
    });

    it('throws error when api fails', async () => {
      globalFetch.mockResolvedValueOnce({
        ok: false,
      });

      const { result } = renderHook(() => useAddComment(), { wrapper: createWrapper() });

      await expect(result.current.mutateAsync({
        itineraryId: 'trip-1',
        text: 'fail',
      })).rejects.toThrow('Failed to add comment');
    });
  });

  describe('useItineraryComments', () => {
    it('fetches comments successfully', async () => {
      const mockComments = [{ id: 'c1', text: 'hello' }];
      globalFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockComments,
      });

      const { result } = renderHook(() => useItineraryComments('trip-1'), { wrapper: createWrapper() });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockComments);
      expect(globalFetch).toHaveBeenCalledWith('/api/itineraries/trip-1/comments', expect.objectContaining({
        headers: expect.objectContaining({
             'x-temp-user-id': 'temp-user-123',
        })
      }));
    });

    it('handles fetch error', async () => {
      globalFetch.mockResolvedValueOnce({
        ok: false,
      });

      const { result } = renderHook(() => useItineraryComments('trip-1'), { wrapper: createWrapper() });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error).toBeDefined();
    });
  });

  describe('useCreateInvite', () => {
      it('calls create invite api successfully', async () => {
          globalFetch.mockResolvedValueOnce({
              ok: true,
              json: async () => ({ token: 'abc' })
          });

          const { result } = renderHook(() => useCreateInvite(), { wrapper: createWrapper() });

          await result.current.mutateAsync('trip-1');

          expect(globalFetch).toHaveBeenCalledWith('/api/invite', expect.objectContaining({
              method: 'POST',
              body: JSON.stringify({ itineraryId: 'trip-1' })
          }));
      });
  });
});
