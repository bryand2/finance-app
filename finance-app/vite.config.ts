import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/__tests__/setup.ts'],
    css: false,
  },

  server: {
    proxy: {
      // Forward /api/finance/* to the local backend proxy (server/index.ts)
      // when running `npm run dev`
      '/api/finance': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
});
