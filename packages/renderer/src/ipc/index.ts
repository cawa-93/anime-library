import {useElectron} from '/@/use/electron';
import type {IpcHost, IpcNameHostsMap} from '/@shared/types/ipc';


type Promisified<T extends IpcHost> = {
  readonly [P in keyof T]: (...a: Parameters<T[P]>) => Promise<ReturnType<T[P]>>;
}


const {invoke} = useElectron();

export function createIpcClient<T extends keyof IpcNameHostsMap>(hostName: T): Promisified<IpcNameHostsMap[T]> {
  return new Proxy({} as Promisified<IpcNameHostsMap[T]>, {
    get: (obj, methodName: string) => {

      // Chrome runtime could try to call those method if the proxy object
      // is passed in a resolve or reject Promise function
      if (methodName === 'then' || methodName === 'catch')
        return undefined;

      // If accessed field effectivly exist on proxied object, act as a noop
      if (Object.prototype.hasOwnProperty.call(obj, methodName)) {
        return obj[methodName];
      }

      return (...args: unknown[]) => {
        return invoke(hostName, methodName, ...args);
      };
    },
  });
}
