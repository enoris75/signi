import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

class MemoryStorage {
  private readonly store = new Map<string, string>();

  clear() { this.store.clear(); }
  getItem(key: string) { return this.store.get(key) ?? null; }
  setItem(key: string, value: string) { this.store.set(key, String(value)); }
  removeItem(key: string) { this.store.delete(key); }
  key(index: number) { return Array.from(this.store.keys())[index] ?? null; }
  get length() { return this.store.size; }
}

if (!globalThis.localStorage) {
  const storage = new MemoryStorage();
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: storage,
  });
}

// jsdom does no layout, so it leaves out scrolling. A no-op lets the pickers scroll their
// highlighted row as they do in the browser; a test that cares spies on it.
Element.prototype.scrollIntoView = () => {};

// Testing Library only unmounts between tests by itself when the runner exposes a global
// `afterEach`, and vitest's globals are off. The stored UI language and any spies would leak the
// same way.
afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.restoreAllMocks();
});
