import type {WindowControllers} from './WindowControllers';

export interface IpcNameHostsMap {
  'WindowControllers': WindowControllers
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type IpcHost = Record<string, (...a: any[]) => any>

