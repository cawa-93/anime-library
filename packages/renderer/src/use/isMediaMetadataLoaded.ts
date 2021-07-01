import type {MaybeRef} from '@vueuse/core';
import {unrefElement, useEventListener} from '@vueuse/core';
import type {Ref} from 'vue';
import {ref} from 'vue';


export function isMediaMetadataLoaded(mediaElement: MaybeRef<HTMLMediaElement | undefined | null>): { isLoaded: Ref<boolean> } {
  const isLoaded = ref(unrefElement(mediaElement) instanceof HTMLMediaElement && unrefElement(mediaElement).readyState > 0);
  useEventListener(mediaElement, 'loadstart', () => isLoaded.value = false);
  useEventListener(mediaElement, 'loadedmetadata', () => isLoaded.value = true);

  return {isLoaded};
}
