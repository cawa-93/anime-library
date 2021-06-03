import type {Ref} from 'vue';
import {ref} from 'vue';
import {useEventListener} from '@vueuse/core';
import {isMaximized as getMaximizedState} from '/@/utils/window-controllers';

export function isWindowMaximized(defaultValue = false): { isMaximized: Ref<boolean> } {

  const isMaximized = ref(defaultValue);
  getMaximizedState().then(v => isMaximized.value = v);

  useEventListener(window, 'resize', () => getMaximizedState().then(v => isMaximized.value = v),
  );

  return {isMaximized};
}
