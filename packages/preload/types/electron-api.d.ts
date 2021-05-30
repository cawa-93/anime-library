interface ElectronApi {
  readonly invoke: (channel: string, ...args: unknown[]) => void
  readonly openURL: (url: string) => Promise<void>
  readonly uuid: () => string
}

declare interface Window {
  electron: Readonly<ElectronApi>
  electronRequire?: NodeRequire
}
