import type { Config } from 'jest';

const config: Config = {
  // Use jsdom to simulate a browser environment
  testEnvironment: 'jsdom',

  // Tell Jest to handle .ts and .tsx files using ts-jest
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { tsconfig: 'tsconfig.spec.json' }],
  },

  // Setup file to run before each test file (used for custom matchers)
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],

  // Module name mapper handles mocking assets like CSS or images if needed
  moduleNameMapper: {
    '\\.(css|less|sass|scss)$': 'identity-obj-proxy',
  },
};

export default config;
