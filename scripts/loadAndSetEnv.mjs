/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
const {loadEnv} = require('vite')

/**
 * Load variables from `.env.[mode]` files in cwd
 * and set it to `process.env`
 *
 * @param {string} mode
 * @param {string} cwd
 *
 * @return {void}
 */
export function loadAndSetEnv(mode, cwd) {
  const env = loadEnv(mode, cwd)
  for (const envKey in env) {
    if (process.env[envKey] === undefined && env.hasOwnProperty(envKey)) {
      process.env[envKey] = env[envKey]
    }
  }

  if (process.env.VITE_APP_VERSION === undefined) {
    const now = new Date;
    process.env.VITE_APP_VERSION = mode === 'development' ? '0.0.0' : `${now.getFullYear() - 2000}.${now.getMonth() + 1}.${now.getDate()}`;
  }

  if (process.env.VITE_BUILD_VERSION === undefined) {
    process.env.VITE_BUILD_VERSION = String(mode === 'development' ? '0' : Math.round((Date.now() / 1000)));
  }
}
