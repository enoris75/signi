import { defineConfig } from 'vitest/config';
import path from 'path';

// Unit tests for the translation engine. They run against the real corpus through the real
// lexicon (see packages/engine/test/harness.ts), so nothing needs building or serving first —
// which is the point of having them alongside the Playwright suite: the engine's grammar is a
// pure function and deserves to be tested combinatorially, in milliseconds, rather than three
// sentences at a time through a browser.
export default defineConfig({
  resolve: {
    alias: {
      // The packages are consumed from source: @signi/shared's package entry points at dist,
      // which need not be built (and whose stale copy in src/ predates the current types).
      '@signi/shared': path.resolve(__dirname, 'packages/shared/src/index.ts'),
    },
  },
  test: {
    include: ['packages/*/test/**/*.test.ts'],
    // The harness seeds an in-memory database on import. Sharing one module registry across the
    // spec files seeds it once for the whole run instead of once per file; the tests only read
    // from it, so there is no isolation to lose.
    isolate: false,
    fileParallelism: false,
  },
});
