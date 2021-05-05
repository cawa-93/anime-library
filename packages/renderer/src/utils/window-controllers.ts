import {createIpcClient} from '/@/ipc';
import type {Promisified} from '/@shared/types/utils';
import type {WindowControllers} from '/@shared/types/ipc/WindowControllers';

let service: Promisified<WindowControllers> | null = null;

export function close(): void {
  window.close();
}

export function minimize(): Promise<void> {
  if (service === null) {
    service = createIpcClient('WindowControllers');
  }

  return service.minimize();
}

export function maximize(): Promise<void> {
  if (service === null) {
    service = createIpcClient('WindowControllers');
  }

  return service.maximize();
}

export function unmaximize(): Promise<void> {
  if (service === null) {
    service = createIpcClient('WindowControllers');
  }

  return service.unmaximize();
}

export function isMaximized(): Promise<boolean> {
  if (service === null) {
    service = createIpcClient('WindowControllers');
  }

  return service.isMaximized();
}
