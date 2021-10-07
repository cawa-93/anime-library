import {useElectron} from '/@/use/electron';
import type {IpcNameHostsMap} from '/@shared/types/ipc';
import type {Promisified} from '/@shared/types/utils';



export function createIpcClient<T extends keyof IpcNameHostsMap>(hostName: T): Promisified<IpcNameHostsMap[T]> {
  const {invoke} = useElectron();

  return new Proxy({} as never, {
    get: (obj, methodName) => {

      // Chrome runtime could try to call those method if the proxy object
      // is passed in a resolve or reject Promise function
      if (methodName === 'then' || methodName === 'catch' || methodName === 'finally')
        return undefined;

      if (Object.prototype.hasOwnProperty.call(obj, methodName)) {
        return obj[methodName];
      }

      return (...args: unknown[]) => {
        return invoke(hostName, methodName, ...args);
      };
    },
  });
}
