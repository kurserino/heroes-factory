/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  // Prevent Vite from clearing the whole terminal on start/restart — when
  // run together with the API via `npm run dev` (root, via concurrently),
  // both processes share one terminal, so Vite's default clearScreen wipes
  // out the API's already-printed logs too.
  clearScreen: false,
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
  },
});
