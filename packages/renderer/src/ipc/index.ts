import {useElectron} from '/@/use/electron';

const {invoke} = useElectron();

const proxyHandlers: ProxyHandler<{ hostName: string, [k: string]: unknown }> = {
  get: (obj, methodName: string) => {

    // Chrome runtime could try to call those method if the proxy object
    // is passed in a resolve or reject Promise function
    if (methodName === 'then' || methodName === 'catch')
      return undefined;

    // If accessed field effectivly exist on proxied object,
    // act as a noop
    if (obj[methodName]) {
      return obj[methodName];
    }

    // Otherwise create an anonymous function on the fly
    return (...args: unknown[]) => {
      // Notice here that we pass the hostName defined
      // in the proxied object
      return invoke(obj.hostName, methodName, ...args);
    };
  },
};

type ipcClientService = Record<string, (...a: unknown[]) => unknown>

export type ipcClient<T extends ipcClientService> = {
  readonly [P in keyof T]: (...a: Parameters<T[P]>) => Promise<ReturnType<T[P]>>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createIpcClient(hostName: string): any {
  const proxyObject = {
    hostName: hostName,
  };

  // Create the proxy object
  return new Proxy(
    proxyObject,
    // Handlers
    proxyHandlers,
  );
}
