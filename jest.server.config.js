module.exports = {
  // Use Node.js environment for server tests
  testEnvironment: 'node',
  // Only transform TypeScript files
  transform: {
    '^.+\\.tsx?$': ['ts-jest']
  },
  // Don't need transformIgnorePatterns for server tests as we're not testing React Native components
  // Use our server-specific setup file
  setupFilesAfterEnv: ['./jest.server.setup.js'],
  // Match our server test files
  testMatch: ['**/__tests__/server/**/*.test.ts'],
  // Root directory
  rootDir: './',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  // Clear mocks between tests
  clearMocks: true,
  // Don't watch files for changes
  watchman: false,
};
