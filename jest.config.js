module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/__tests__/'],
  moduleNameMapper: { '^@engine/(.*)$': '<rootDir>/src/engine/$1' },
};
