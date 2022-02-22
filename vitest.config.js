import { defineConfig } from 'vite';

export default defineConfig({
  test: {
    testTimeout: 50_000,
    hookTimeout: 50_000,
    include: ['./tests/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
  },
});
