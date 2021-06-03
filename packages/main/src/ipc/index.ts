import {ipcMain} from 'electron';
import type {IpcNameHostsMap} from '/@shared/types/ipc';


function hasProperty<T>(host: T, prop: string): prop is string & keyof T {
  return !!(host as never)[prop];
}


export function registerIpcHost<T extends keyof IpcNameHostsMap>(hostName: T, host: IpcNameHostsMap[T]): void {
  ipcMain.handle(hostName, async (_event, methodName: unknown, ...args) => {
    if (typeof methodName !== 'string') {
      throw new Error(`methodName must be a string (got ${JSON.stringify(methodName)}) when called host "${hostName}"`);
    }

    if (!hasProperty(host, methodName)) {
      throw new Error(`"${methodName}" is undefined method on host "${hostName}"`);
    }

    const method = host[methodName];

    if (typeof method !== 'function') {
      throw new Error(`"${methodName}" in not a function on host "${hostName}"`);
    }

    return method(...args);
  });
}
