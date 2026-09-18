import '@testing-library/jest-dom/vitest';
import { afterEach, beforeEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import { JSDOM } from 'jsdom';
const storage = new JSDOM('', { url: 'http://localhost' }).window.localStorage;
beforeEach(() => {
  vi.stubGlobal('localStorage', storage);
  localStorage.clear();
});
afterEach(cleanup);

if (typeof window.matchMedia !== 'function') {
  window.matchMedia = (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  });
}
