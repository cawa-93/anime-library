import type {MaybeRef} from '@vueuse/core';
import {unrefElement, useEventListener} from '@vueuse/core';
import type {Ref} from 'vue';
import {ref} from 'vue';


export function isMediaMetadataLoaded(mediaElement: MaybeRef<HTMLMediaElement | undefined | null>): { isLoaded: Ref<boolean> } {
  const el = unrefElement(mediaElement);
  const isLoaded = ref(el instanceof HTMLMediaElement && el.readyState > 0);
  useEventListener(mediaElement, 'loadstart', () => isLoaded.value = false);
  useEventListener(mediaElement, 'loadedmetadata', () => isLoaded.value = true);

  return {isLoaded};
}
