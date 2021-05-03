import {ipcMain} from 'electron';


// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function registerIpcHost(hostName: string, host: { [k: string]: any }): void {
  ipcMain.handle(hostName, async (event, methodName: string, ...args) => {
    const method = host[methodName];

    // If requested method does not exist, reject.
    if (typeof method !== 'function') {
      throw new Error(`Invalid method name "${methodName}" on host "${hostName}"`);
    }

    return method(...args);
  });

}
