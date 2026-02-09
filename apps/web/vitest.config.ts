import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    name: 'web',
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.tsx'],
    exclude: [
      'node_modules/**',
      'src/test/e2e/**',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData',
        '**/.next',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@tikit/types': path.resolve(__dirname, '../../packages/types/src'),
      '@tikit/api': path.resolve(__dirname, '../../packages/api/src'),
    },
  },
});
