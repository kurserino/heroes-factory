/** @type {import('jest').Config} */
module.exports = {
  rootDir: '..',
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['<rootDir>/test/unit/**/*.spec.ts'],
};
