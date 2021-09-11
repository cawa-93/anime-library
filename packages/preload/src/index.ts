import {contextBridge, ipcRenderer, shell} from 'electron';

// TODO: Заменить на `const { randomUUID } = require('crypto');` после node v14.17
import {v4} from 'uuid';


const apiKey = 'electron';
/**
 * @see https://github.com/electron/electron/issues/21437#issuecomment-573522360
 */
const api: ElectronApi = {
  invoke: (...args) => ipcRenderer.invoke(...args),
  openURL: (url) => shell.openExternal(url),
  uuid: v4,
};

contextBridge.exposeInMainWorld(apiKey, api);
