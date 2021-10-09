interface ElectronApi {
  readonly invoke: (channel: string, ...args: unknown[]) => void
}

declare interface Window {
  electron: Readonly<ElectronApi>
}
