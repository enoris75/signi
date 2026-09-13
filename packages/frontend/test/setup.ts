import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

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
