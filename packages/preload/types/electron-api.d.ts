
interface ElectronApi {
  readonly close: () => void
  readonly minimize: () => void
  readonly maximize: () => void
  readonly unmaximize: () => void
  readonly onMaximizeChange: (callback: (isMaximized: boolean) => void) => void
}

declare interface Window {
  electron: Readonly<ElectronApi>
  electronRequire?: NodeRequire
}
