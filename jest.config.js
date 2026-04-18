/**
 * ============================================
 * MediFollow - Jest Configuration
 * ============================================
 *
 * Configures Jest for both backend and frontend tests:
 *   - Path alias @/ → project root
 *   - Backend tests run in "node" environment
 *   - Frontend tests (.jsx/.tsx) run in "jsdom" environment
 *   - Coverage reporters: lcov (for SonarQube) + text (for terminal)
 */

/** @type {import('jest').Config} */
const config = {
  // -------------------------------------------------------------------
  // Projects: separate configs for backend (node) and frontend (jsdom)
  // -------------------------------------------------------------------
  projects: [
    // ---- Backend tests (Node environment) ----
    {
      displayName: "backend",
      testEnvironment: "node",
      testMatch: ["<rootDir>/__tests__/backend/**/*.test.{js,ts}"],
      moduleNameMapper: {
        // Map @/ imports to the project root
        "^@/(.*)$": "<rootDir>/$1",
      },
      transform: {
        "^.+\\.(ts|tsx)$": ["ts-jest", { tsconfig: { jsx: "react-jsx" } }],
        "^.+\\.(js|jsx)$": ["babel-jest", { presets: ["next/babel"] }],
      },
      transformIgnorePatterns: ["/node_modules/"],
    },

    // ---- Frontend tests (jsdom environment) ----
    {
      displayName: "frontend",
      testEnvironment: "jsdom",
      testMatch: ["<rootDir>/__tests__/frontend/**/*.test.{js,jsx,ts,tsx}"],
      moduleNameMapper: {
        // Map @/ imports to the project root
        "^@/(.*)$": "<rootDir>/$1",
        // Mock CSS/image imports
        "\\.(css|less|scss|sass)$": "<rootDir>/__mocks__/styleMock.js",
        "\\.(jpg|jpeg|png|gif|svg)$": "<rootDir>/__mocks__/fileMock.js",
      },
      transform: {
        "^.+\\.(ts|tsx)$": ["ts-jest", { tsconfig: { jsx: "react-jsx" } }],
        "^.+\\.(js|jsx)$": ["babel-jest", { presets: ["next/babel"] }],
      },
      transformIgnorePatterns: ["/node_modules/"],
    },
  ],

  // -------------------------------------------------------------------
  // Coverage configuration
  // Only collect from files that our admin tests actually cover.
  // Excludes all .tsx dashboard pages (they need a full Next.js build
  // context and are covered by integration/E2E tests instead).
  // -------------------------------------------------------------------
  collectCoverageFrom: [
    "app/api/admin/**/*.{ts,js}",
    "!app/dashboard/admin/**",
    "!components/admin/**",
    "!lib/**",
    "!**/*.d.ts",
    "!**/node_modules/**",
  ],
  coverageReporters: ["lcov", "text", "text-summary"],
  coverageDirectory: "coverage",
};

module.exports = config;
