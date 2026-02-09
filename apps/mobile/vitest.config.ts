import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    name: 'mobile',
    globals: true,
    environment: 'node',
    setupFiles: ['./__tests__/setup.ts'],
    include: ['./__tests__/**/*.test.{ts,tsx}'],
    exclude: ['node_modules/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        '__tests__/setup.ts',
        '**/*.d.ts',
        '**/*.config.*',
      ],
    },
  },
});
