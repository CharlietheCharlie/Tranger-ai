
import { defineConfig } from 'vitest/config';


export default defineConfig({
  plugins: [],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['tests/e2e/**/*', 'node_modules'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['components/**/*.tsx', 'services/**/*.ts', 'lib/**/*.ts', 'contexts/**/*.tsx'],
      exclude: ['**/*.d.ts', 'tests/**/*'],
    },
  },
});
