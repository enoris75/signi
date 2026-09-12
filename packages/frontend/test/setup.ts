import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

// Testing Library only unmounts between tests by itself when the runner exposes a global
// `afterEach`, and vitest's globals are off. The stored UI language would leak the same way.
afterEach(() => {
  cleanup();
  localStorage.clear();
});
