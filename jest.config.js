module.exports = {
  moduleFileExtensions: [
    'js',
    'ts',
    'json',
  ],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },

  moduleNameMapper: {
    '^/@/(.*)$': '<rootDir>/packages/renderer/src/$1',
  },

  globals: {
    'ts-jest': {
      tsconfig: 'packages/renderer/tsconfig.json',
    },
  },
};
