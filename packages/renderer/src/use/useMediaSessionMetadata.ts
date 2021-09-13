import type {MaybeRef} from '@vueuse/core';
import {tryOnBeforeUnmount} from '@vueuse/core';
import {isRef, unref, watch} from 'vue';


export function useMediaSessionMetadata($data: MaybeRef<MediaMetadataInit | null | undefined>): void {
  const set = (data: MediaMetadataInit | undefined | null) => {
    if (data) {

      console.log('set', data);
      navigator.mediaSession.metadata = data ? new MediaMetadata(data) : null;
    }
  };

  set(unref($data));

  if (isRef($data)) {
    watch($data, set);
  }

  tryOnBeforeUnmount(() => navigator.mediaSession.metadata = null);
}
