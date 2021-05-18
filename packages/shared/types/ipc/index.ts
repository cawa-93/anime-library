import type {WindowControllers} from './WindowControllers';
import type {DialogsControllers} from './DialogsControllers';

export interface IpcNameHostsMap {
  'WindowControllers': WindowControllers
  'DialogsControllers': DialogsControllers
}

