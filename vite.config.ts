import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

/**
 * Repo-Name für GitHub Pages (Spezifikation Abschnitt 1: Vite-Base).
 * Muss mit dem Namen des GitHub-Repositories übereinstimmen.
 */
export const REPO_NAME = 'ki-konzept-werkstatt';

export default defineConfig({
  base: `/${REPO_NAME}/`,
  plugins: [react()],
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
