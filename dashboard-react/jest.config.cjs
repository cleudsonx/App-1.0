module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleFileExtensions: ['js', 'jsx'],
  testMatch: ['**/*.test.jsx'],
  transform: {
    '^.+\\.[jt]sx?$': 'babel-jest'
  },
};
