import {ipcMain} from 'electron';
import type {IpcNameHostsMap} from '/@shared/types/ipc';


export function registerIpcHost<T extends keyof IpcNameHostsMap>(hostName: T, host: IpcNameHostsMap[T]): void {
  ipcMain.handle(hostName, async (event, methodName: string, ...args) => {
    const method = host[methodName];

    // If requested method does not exist, reject.
    if (typeof method !== 'function') {
      throw new Error(`Invalid method name "${methodName}" on host "${hostName}"`);
    }

    return method(...args);
  });

}
