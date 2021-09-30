const {getAppVersion} = require('./getAppVersion.cjs');


/**
 * @type {import('electron-builder').Configuration}
 * @see https://www.electron.build/configuration/configuration
 */
const config = {
  directories: {
    output: 'dist',
    buildResources: 'buildResources',
  },
  files: [
    'packages/**/dist/**',
    // '!node_modules/**', // Не работает из-за semver
  ],
  extraMetadata: {
    version: getAppVersion(),
  },
  nsis: {
    installerLanguages: 'ru',
    language: '1049',
  },
};

module.exports = config;
