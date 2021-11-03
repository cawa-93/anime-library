import type {Ref} from 'vue';
import {ref} from 'vue';
import {useEventListener} from '@vueuse/core';


export function isWindowMaximized(defaultValue = false): { isMaximized: Ref<boolean> } {
  const isMaximized = ref(defaultValue);

  useEventListener(globalThis, 'electron-window:maximize', () => isMaximized.value = true);
  useEventListener(globalThis, 'electron-window:unmaximize', () => isMaximized.value = false);

  return {isMaximized};
}
