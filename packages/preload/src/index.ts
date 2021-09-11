import {contextBridge, ipcRenderer, shell} from 'electron';
import {randomUUID} from 'crypto';


const apiKey = 'electron';
/**
 * @see https://github.com/electron/electron/issues/21437#issuecomment-573522360
 */
const api: ElectronApi = {
  invoke: (...args) => ipcRenderer.invoke(...args),
  openURL: (url) => shell.openExternal(url),
  uuid: randomUUID,
};

contextBridge.exposeInMainWorld(apiKey, api);
