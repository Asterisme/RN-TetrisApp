module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/__tests__/'],
  testMatch: ['**/*.test.ts'],
  moduleNameMapper: { '^@engine/(.*)$': '<rootDir>/src/engine/$1' },
};
