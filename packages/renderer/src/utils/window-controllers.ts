import {createIpcClient} from '/@/ipc';
import type {Promisified} from '/@shared/types/utils';
import type {WindowControllers} from '/@shared/types/ipc/WindowControllers';

let service: Promisified<WindowControllers> | null = null;

function getService() {
  if (service === null) {
    service = createIpcClient('WindowControllers');
  }

  return service;
}

export function close(): void {
  window.close();
}


export function minimize(): Promise<void> {
  return getService().minimize();
}

export function maximize(): Promise<void> {
  return getService().maximize();
}

export function unmaximize(): Promise<void> {
  return getService().unmaximize();
}

export function isMaximized(): Promise<boolean> {
  return getService().isMaximized();
}
