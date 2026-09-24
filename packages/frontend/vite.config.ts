import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@signi/shared': path.resolve(__dirname, '../shared/src/index.ts'),
      // The phrase model and language (P13), whose modules the frontend imports one by one.
      '@signi/phrase/': path.resolve(__dirname, '../phrase/src') + '/',
    },
  },
  server: {
    port: 5173,
    proxy: {
      // The e2e suite runs its own backend on a spare port so it never talks to the
      // dev server's database; everything else gets the usual :3001.
      '/api': process.env['SIGNI_API_URL'] ?? 'http://localhost:3001',
    },
  },
});
