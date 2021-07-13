import {isRef, onUnmounted, watch} from 'vue';
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
    navigator.mediaSession.setActionHandler(action, null);
  }
}


export function useMediaSessionActionsHandlers(handlers: MaybeRef<ActionsHandlers>): void {
  onUnmounted(clearActionHandlers);

  if (isRef(handlers)) {
    watch(handlers, setActionHandlers);
  } else {
    setActionHandlers(handlers);
  }
}
