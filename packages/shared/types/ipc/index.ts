import type {WindowControllers} from './WindowControllers';

export interface IpcNameHostsMap {
  'WindowControllers': WindowControllers
}

export type IpcHost = Record<string, (...a: unknown[]) => unknown>
