import type { Ref} from 'vue';
import {isRef, onUnmounted, watch, watchEffect, unref} from 'vue';
import type {MaybeRef} from '@vueuse/core';


export interface ActionsHandlers {
  play?: (details: MediaSessionActionDetails) => void,
  pause?: (details: MediaSessionActionDetails) => void,
  seekbackward?: (details: MediaSessionActionDetails) => void,
  seekforward?: (details: MediaSessionActionDetails) => void,
  nexttrack?: (details: MediaSessionActionDetails) => void,
  previoustrack?: (details: MediaSessionActionDetails) => void,
  stop?: (details: MediaSessionActionDetails) => void
  seekto?: (details: Required<Pick<MediaSessionActionDetails, 'seekTime'>> & MediaSessionActionDetails) => void
}


const defaultHandlers = {
  play: null,
  pause: null,
  seekbackward: null,
  seekforward: null,
  nexttrack: null,
  previoustrack: null,
  stop: null,
  seekto: null,
};


function setActionHandlers(handlers: ActionsHandlers) {
  for (const actionKey in defaultHandlers) {
    const action = actionKey as keyof typeof defaultHandlers;
    const handler = handlers[action] || null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    navigator.mediaSession.setActionHandler(action, handler as any);
  }
}


function clearActionHandlers() {
  for (const action in defaultHandlers) {
    navigator.mediaSession.setActionHandler((action as keyof typeof defaultHandlers), null);
  }
}


export function useMediaSessionActionsHandlers(handlers: ActionsHandlers | Ref<ActionsHandlers>): void {
  onUnmounted(clearActionHandlers);

  if (isRef(handlers)) {
    watch(handlers, setActionHandlers);
  } else {
    setActionHandlers(handlers);
  }
}

interface Image {
  // URL from which the user agent can fetch the image’s data.
  src: string;
  // Specify the MediaImage object’s sizes. It follows the spec of sizes attribute in HTML link element.
  sizes?: string | undefined;
  // A hint as to the media type of the image.
  type?: string | undefined;
}

export interface Metadata {
  // Media's title.
  title?: string;
  // Media's artist.
  artist?: string;
  // Media's album.
  album?: string;
  // Media's artwork.
  artwork?: Image[];
}

export function useMediaSessionMetadata(metadata: MaybeRef<Metadata | null>): void {
  onUnmounted(() => navigator.mediaSession.metadata = null);
  watchEffect(() => {
    const data = unref(metadata);
    navigator.mediaSession.metadata = data ? new MediaMetadata(data) : null;
  });
}
