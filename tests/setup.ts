
import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';


// Clean up DOM after each test
afterEach(() => {
  cleanup();
});

// Mock window.open
window.open = vi.fn();

// Mock IntersectionObserver
const IntersectionObserverMock = vi.fn(() => ({
  disconnect: vi.fn(),
  observe: vi.fn(),
  takeRecords: vi.fn(),
  unobserve: vi.fn(),
}));
vi.stubGlobal('IntersectionObserver', IntersectionObserverMock);

// Mock Scroll methods
vi.stubGlobal('scrollTo', vi.fn());
vi.stubGlobal('scrollIntoView', vi.fn());
