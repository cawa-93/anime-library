import type {IpcHost} from './Host';
import type {ClearIndex, Fn} from '../utils';
import type {UserSettingsController} from './UserSettingsController';
import type {ColorSchemeController} from './ColorSchemeController';



interface IpcNameHostsMapBase extends Record<string, IpcHost<Record<string, Fn>>> {
  'UserSettingsController': UserSettingsController
  'ColorSchemeController': ColorSchemeController
}


export type IpcNameHostsMap = ClearIndex<IpcNameHostsMapBase>
