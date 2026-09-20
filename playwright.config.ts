import { defineConfig, devices } from '@playwright/test';
import path from 'path';

// The e2e stack runs on its own ports against its own database, so a suite run never
// collides with — or writes into — the dev servers the user may already have on
// :5173/:3001. globalSetup seeds the throwaway database these point at.
export const BACKEND_PORT = 3101;
export const FRONTEND_PORT = 5273;
export const E2E_DB_PATH = path.join(__dirname, 'e2e', '.tmp', 'e2e.db');

export default defineConfig({
  testDir: './e2e',
  // The builder is a geometry feedback loop; a flake here usually means a real bug, so
  // retry only on CI (for infrastructure noise) and never locally.
  retries: process.env['CI'] ? 2 : 0,
  workers: process.env['CI'] ? 1 : undefined,
  // CI runs the suite in four shards, and a shard is drawn from whole *files* unless every test
  // counts as a group of its own — with 73 specs in definition-tooltip.spec and 55 in tidy.spec,
  // file-sized groups split 104/18/96/8 and the first shard is the whole problem again. With one
  // worker this changes nothing about how tests run, only how evenly the four shards divide.
  // Locally, where workers are plentiful, it would set tests inside a file racing each other for
  // the CPU — and the geometry specs measure a laid-out canvas — so it stays off.
  fullyParallel: !!process.env['CI'],
  reporter: process.env['CI'] ? [['github'], ['html', { open: 'never' }]] : [['list']],
  timeout: 30_000,
  expect: { timeout: 10_000 },

  use: {
    baseURL: `http://localhost:${FRONTEND_PORT}`,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    viewport: { width: 1500, height: 1000 },
  },

  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],

  webServer: [
    {
      // Reseeds the throwaway database, then listens. See e2e/serveBackend.ts.
      command: 'npx tsx e2e/serveBackend.ts',
      env: {
        PORT: String(BACKEND_PORT),
        SIGNI_DB_PATH: E2E_DB_PATH,
      },
      url: `http://localhost:${BACKEND_PORT}/api/concepts`,
      reuseExistingServer: false,
      stdout: 'pipe',
      stderr: 'pipe',
    },
    {
      command: `npm run dev --workspace=packages/frontend -- --port ${FRONTEND_PORT} --strictPort`,
      env: { SIGNI_API_URL: `http://localhost:${BACKEND_PORT}` },
      url: `http://localhost:${FRONTEND_PORT}`,
      reuseExistingServer: false,
      stdout: 'pipe',
      stderr: 'pipe',
    },
  ],
});
