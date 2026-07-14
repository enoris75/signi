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
