import {app} from 'electron';
import path from 'path';
import fs from 'fs';
import type {UserSettings} from '/@shared/types/ipc/UserSettingsController';


const SETTINGS_FILENAME = 'user-settings.json';
const SETTINGS_DIR_PATH = app.getPath('userData');
const SETTINGS_FILE_PATH = path.join(SETTINGS_DIR_PATH, SETTINGS_FILENAME);
let settingsCache: Map<keyof UserSettings, UserSettings[keyof UserSettings]> | undefined = undefined;


function loadSettingsSync() {
  if (settingsCache !== undefined) {
    return settingsCache;
  }

  if (!fs.existsSync(SETTINGS_FILE_PATH)) {
    return undefined;
  }

  settingsCache = new Map(JSON.parse(fs.readFileSync(SETTINGS_FILE_PATH, {encoding: 'utf-8'})));
  return settingsCache;
}


function loadSettings() {
  if (settingsCache !== undefined) {
    return Promise.resolve(settingsCache);
  }


  return fs.promises.access(SETTINGS_FILE_PATH, fs.constants.W_OK)
    .then(() => fs.promises.readFile(SETTINGS_FILE_PATH, {encoding: 'utf-8'}))
    .then(str => {
      settingsCache = new Map(JSON.parse(str));
      return settingsCache;
    })
    .catch(() => {
      return undefined;
    });
}


export function getSync<K extends keyof UserSettings>(name: K, defaultValue?: UserSettings[K]): UserSettings[K] | undefined {
  const settings = loadSettingsSync();
  return settings
    ? (settings.get(name) as UserSettings[K]) || defaultValue
    : defaultValue;
}


export function get<K extends keyof UserSettings>(name: K, defaultValue?: UserSettings[K]): Promise<UserSettings[K] | undefined> {
  return loadSettings().then(settings => {
    return settings
      ? (settings.get(name) as UserSettings[K]) || defaultValue
      : defaultValue;
  });
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
    if (err instanceof Error && (err as NodeJS.ErrnoException).code === 'ENOENT') {
      fs.mkdirSync(SETTINGS_DIR_PATH);
    } else {
      throw err;
    }
  }
}

/**
 * Ensures that the settings directory exists. If it does
 * not exist, then it is created.
 *
 * @returns A promise which resolves when the settings dir exists.
 * @internal
 */
function ensureSettingsDir(): Promise<void> {
  return fs.promises.access(SETTINGS_DIR_PATH)
    .catch((err: unknown) => {
      if (err instanceof Error && (err as NodeJS.ErrnoException).code === 'ENOENT') {
        return fs.promises.mkdir(SETTINGS_DIR_PATH);
      }

      return Promise.reject(err);
    });
}


export function setSync<K extends keyof UserSettings>(name: K, value: UserSettings[K]): void {
  let settings = loadSettingsSync();

  if (!settings) {
    settings = new Map;
  }

  settings.set(name, value);

  settingsCache = settings;

  ensureSettingsDirSync();

  fs.writeFileSync(SETTINGS_FILE_PATH, JSON.stringify([...settings.entries()]), {encoding: 'utf-8'});
}


export function set<K extends keyof UserSettings>(name: K, value: UserSettings[K]): Promise<void> {
  return loadSettings().then(settings => {
    if (!settings) {
      settings = new Map;
    }

    settings.set(name, value);
    settingsCache = settings;

    const str = JSON.stringify([...settings.entries()]);
    return ensureSettingsDir().then(() => fs.promises.writeFile(SETTINGS_FILE_PATH, str, {encoding: 'utf-8'}));

  });
}
