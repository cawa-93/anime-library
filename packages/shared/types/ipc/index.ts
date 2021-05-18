import type {WindowControllers} from './WindowControllers';
import type {DialogsControllers} from './DialogsControllers';
import type { App } from './App';

export interface IpcNameHostsMap {
  'WindowControllers': WindowControllers
  'DialogsControllers': DialogsControllers
  'App': App
}

