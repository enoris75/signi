import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      // The packages are consumed from source: @signi/shared's package entry points at dist,
      // which need not be built (and whose stale copy in src/ predates the current types).
      '@signi/shared': path.resolve(__dirname, 'packages/shared/src/index.ts'),
    },
  },
  test: {
    projects: [
      {
        extends: true,
        test: {
          // Unit tests for the translation engine. They run against the real corpus through the
          // real lexicon (see packages/engine/test/harness.ts), so nothing needs building or
          // serving first — which is the point of having them alongside the Playwright suite: the
          // engine's grammar is a pure function and deserves to be tested combinatorially, in
          // milliseconds, rather than three sentences at a time through a browser.
          // Function-level unit tests live next to the source they test (src/**/*.test.ts) and build
          // their resolved inputs by hand instead of going through the lexicon.
          name: 'engine',
          include: ['packages/engine/test/**/*.test.ts', 'packages/engine/src/**/*.test.ts'],
          // The harness seeds an in-memory database on import. Sharing one module registry across
          // the spec files seeds it once for the whole run instead of once per file; the tests
          // only read from it, so there is no isolation to lose.
          isolate: false,
          fileParallelism: false,
          // Projects with different worker counts must run as separate groups; the engine goes first.
          sequence: { groupOrder: 0 },
        },
      },
      {
        extends: true,
        test: {
          // Component tests for the frontend: one component rendered into jsdom, no backend. The
          // geometry and wiring of the whole builder stay with the Playwright suite.
          name: 'frontend',
          include: ['packages/frontend/test/**/*.test.{ts,tsx}'],
          environment: 'jsdom',
          setupFiles: ['packages/frontend/test/setup.ts'],
          sequence: { groupOrder: 1 },
        },
      },
      {
        extends: true,
        resolve: {
          alias: {
            // Like @signi/shared above: the engine's package entry points at dist, which is
            // gitignored and goes stale after every engine edit, so the backend's boot renders are
            // tested against the engine's source instead.
            '@signi/engine': path.resolve(__dirname, 'packages/engine/src/index.ts'),
          },
        },
        test: {
          // Unit tests for the backend, next to the source they test (src/**/*.test.ts). They run
          // against the real schema and the real corpus, seeded into an in-memory database per file:
          // every module holds its connection in a singleton and seed.ts works on import, so each
          // file keeps its own module registry (the default isolation) and with it its own database.
          name: 'backend',
          include: ['packages/backend/src/**/*.test.ts'],
          // db.ts reads this when it is first imported, so no test can open the developer's
          // signi.db by accident; a test that needs a file on disk points it elsewhere first.
          env: { SIGNI_DB_PATH: ':memory:' },
          sequence: { groupOrder: 1 },
        },
      },
    ],
  },
});
