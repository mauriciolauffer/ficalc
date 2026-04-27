/// <reference types="vitest" />
import { defineConfig } from 'vite';

export default defineConfig({
  root: './',
  build: {
    outDir: 'dist',
  },
  test: {
    coverage: {
      provider: 'v8',
      thresholds: {
        lines: 85,
        functions: 85,
        branches: 85,
        statements: 85,
      },
      include: ['src/logic.ts'],
    },
  },
});
