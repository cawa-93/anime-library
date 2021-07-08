import {app} from 'electron';
import path from 'path';
import fs from 'fs';

const SETTINGS_FILENAME = 'user-settings.json';
const SETTINGS_DIR_PATH = app.getPath('userData');
const SETTINGS_FILE_PATH = path.join(SETTINGS_DIR_PATH, SETTINGS_FILENAME);

let settingsCache: Record<string, unknown> | null = null;

function loadSettingsSync(): Record<string, unknown> | undefined {
  if (settingsCache !== null) {
    return settingsCache;
  }

  if (!fs.existsSync(SETTINGS_FILE_PATH)) {
    return undefined;
  }

  settingsCache = JSON.parse( fs.readFileSync(SETTINGS_FILE_PATH, {encoding: 'utf-8'}) );
  return settingsCache || undefined;
}

export function getSync<T extends unknown>(name: string, defaultValue?: T): T | undefined {
  console.log('[getSync]', {name, defaultValue});
  const settings = loadSettingsSync();
  return settings
    ? settings[name] as T
    : defaultValue;
}



/**
 * Ensures that the settings directory exists. If it does
 * not exist, then it is created.
 *
 * @internal
 */
function ensureSettingsDirSync(): void {
  try {
    fs.statSync(SETTINGS_DIR_PATH);
  } catch (err) {
    if (err.code === 'ENOENT') {
      fs.mkdirSync(SETTINGS_DIR_PATH);
    } else {
      throw err;
    }
  }
}


export function setSync(name: string, value: unknown): void {
  console.log('[setSync]', {name, value});
  let settings = loadSettingsSync();

  if (!settings) {
    settings = {};
  }

  settings[name] = value;

  settingsCache = settings;

  ensureSettingsDirSync();

  fs.writeFileSync(SETTINGS_FILE_PATH, JSON.stringify(settings), {encoding: 'utf-8'});
}
