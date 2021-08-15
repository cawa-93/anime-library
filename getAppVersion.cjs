module.exports.getAppVersion = function getAppVersion(mode = process.env.MODE || 'production') {
  if (process.env.VITE_APP_VERSION !== undefined) {
    return process.env.VITE_APP_VERSION;
  }

  if (mode === 'development') {
    process.env.VITE_APP_VERSION = '0.0.0';
  } else {
    const now = new Date;
    process.env.VITE_APP_VERSION = `${now.getUTCFullYear() - 2000}.${now.getUTCMonth() + 1}.${now.getUTCDate()}-${now.getUTCHours() * 60 + now.getUTCMinutes()}`;
  }

  return process.env.VITE_APP_VERSION;
}
