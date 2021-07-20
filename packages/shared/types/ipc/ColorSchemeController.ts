import type {IpcHost} from './Host';


export type ColorSchemeController = IpcHost<{
  setColorScheme: (scheme: 'system' | 'light' | 'dark') => boolean
}>
