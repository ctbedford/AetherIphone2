/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  displayName: 'Server',
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['<rootDir>/__tests__/server/**/*.test.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  // Do NOT include setupFilesAfterEnv that point to UI-specific setup (like jest.setup.js)
  // Add any server-specific setup files here if needed in the future
  // setupFilesAfterEnv: ['./jest.server.setup.js'],
  clearMocks: true, // Good practice to clear mocks between tests
};
