import type {Ref} from 'vue';
import {ref} from 'vue';
import {useDebounceFn, useEventListener} from '@vueuse/core';
import {createIpcClient} from '/@/ipc';

export function isWindowMaximized(defaultValue = false): { isMaximized: Ref<boolean> } {
  const {isMaximized: getMaximizedState} = createIpcClient('WindowControllers');

  const isMaximized = ref(defaultValue);
  getMaximizedState().then(v => isMaximized.value = v);

  useEventListener(window, 'resize', useDebounceFn(() => {
    getMaximizedState().then(v => isMaximized.value = v);
  }, 100));

  return {isMaximized};
}
