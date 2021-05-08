interface Document {
  pictureInPictureElement?: HTMLElement
  exitPictureInPicture: () => void
}

interface HTMLVideoElement {
  requestPictureInPicture: () => void
}
