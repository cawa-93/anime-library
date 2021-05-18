import {createIpcClient} from '/@/ipc';
import type {Promisified} from '/@shared/types/utils';
import type {App} from '/@shared/types/ipc/App';

let service: Promisified<App> | null = null;

function getService() {
  if (service === null) {
    service = createIpcClient('App');
  }

  return service;
}

export function getAppVersion(): Promise<string> {
  return getService().getVersion();
}
