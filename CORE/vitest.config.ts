import { defineConfig } from 'vitest/config';
import path from 'path';

export const vitestConfig = defineConfig({
  resolve: {
    alias: {
      '@/': path.resolve(__dirname, 'apps/web/src') + '/',
      '@stocker/shared': path.resolve(__dirname, 'packages/shared/src/index.ts'),
      '@stocker/analytics': path.resolve(__dirname, 'packages/analytics/src/index.ts'),
      '@stocker/market-data': path.resolve(__dirname, 'packages/market-data/src/index.ts'),
      '@stocker/advisor': path.resolve(__dirname, 'packages/advisor/src/index.ts'),
    },
  },
  test: {
    globals: true,
    include: [
      'packages/**/__tests__/**/*.test.ts',
      'packages/**/__tests__/**/*.spec.ts',
      'apps/**/__tests__/**/*.test.ts',
      'apps/**/__tests__/**/*.spec.ts',
      'data/test/**/*.test.ts',
    ],
    exclude: ['**/node_modules/**', '**/dist/**', '**/.next/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
  },
});

export default vitestConfig;
