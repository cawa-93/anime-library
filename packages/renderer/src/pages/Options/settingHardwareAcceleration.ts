// import {createIpcClient} from '/@/ipc';


// const userSettings = createIpcClient('UserSettingsController');

const SETTINGS_KEY = 'enable_hardware_acceleration';


export function isEnabled(): Promise<boolean> {
  return Promise.resolve(false); //userSettings.get(SETTINGS_KEY).then(v => !!v);
}


export function setEnabled(value: boolean): Promise<void> {
  return Promise.resolve(); //userSettings.set(SETTINGS_KEY, value);
}
