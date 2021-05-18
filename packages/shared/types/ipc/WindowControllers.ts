export interface WindowControllers {
  minimize: () => void
  maximize: () => void
  unmaximize: () => void
  close: () => void
  isMaximized: () => boolean
}
