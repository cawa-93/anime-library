import type {IpcHost} from './Host';

export interface UserSettings {
  enable_hardware_acceleration: boolean
  color_scheme: 'system' | 'light' | 'dark'
}

export type UserSettingsController = IpcHost<{
  get: <K extends keyof UserSettings>(name: K, defaultValue?: UserSettings[K]) => Promise<UserSettings[K] | undefined>
  set: <K extends keyof UserSettings>(name: K, value: UserSettings[K]) => void
}>
