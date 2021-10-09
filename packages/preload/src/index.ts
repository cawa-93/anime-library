import {contextBridge, ipcRenderer} from 'electron';
import {randomUUID} from 'crypto';
import './openExternalURL/index';

const apiKey = 'electron';
/**
 * @see https://github.com/electron/electron/issues/21437#issuecomment-573522360
 */
const api: ElectronApi = {
  invoke: (...args) => ipcRenderer.invoke(...args),
  uuid: randomUUID,
};

contextBridge.exposeInMainWorld(apiKey, api);
