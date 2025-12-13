
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getTempUserId, clearTempUserId } from '../../../lib/client-utils';
import Cookies from 'js-cookie';

// Mock uuid
vi.mock('uuid', () => ({
  v4: vi.fn(() => 'new-uuid-123'),
}));

// Mock js-cookie
vi.mock('js-cookie', () => ({
  default: {
    get: vi.fn(),
    set: vi.fn(),
    remove: vi.fn(),
  },
}));

describe('client-utils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getTempUserId', () => {
    it('returns existing temp user id from cookie', () => {
      vi.mocked(Cookies.get).mockReturnValue('existing-id');

      const id = getTempUserId();

      expect(id).toBe('existing-id');
      expect(Cookies.get).toHaveBeenCalledWith('tempUserId');
      expect(Cookies.set).not.toHaveBeenCalled();
    });

    it('creates and returns new temp user id if cookie is missing', () => {
      vi.mocked(Cookies.get).mockReturnValue(undefined);

      const id = getTempUserId();

      expect(id).toBe('new-uuid-123');
      expect(Cookies.get).toHaveBeenCalledWith('tempUserId');
      expect(Cookies.set).toHaveBeenCalledWith('tempUserId', 'new-uuid-123', expect.objectContaining({ expires: 365 }));
    });
  });

  describe('clearTempUserId', () => {
    it('removes temp user id cookie', () => {
      clearTempUserId();

      expect(Cookies.remove).toHaveBeenCalledWith('tempUserId');
    });
  });
});
