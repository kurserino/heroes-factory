/** @type {import('jest').Config} */
module.exports = {
  rootDir: '..',
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['<rootDir>/test/integration/**/*.e2e-spec.ts'],
  testTimeout: 30000,
};
