import type {Ref} from 'vue';
import {ref} from 'vue';
import {useDebounceFn, useEventListener} from '@vueuse/core';
import type {ipcClient} from '/@/ipc';
import {createIpcClient} from '/@/ipc';
import type {WindowControllers} from '/@shared/types/ipc/WindowControllers';

export function isWindowMaximized(defaultValue = false): { isMaximized: Ref<boolean> } {
  const {isMaximized: getMaximizedState} = createIpcClient('WindowController') as ipcClient<WindowControllers>;

  const isMaximized = ref(defaultValue);
  getMaximizedState().then(v => isMaximized.value = v);

  useEventListener(window, 'resize', useDebounceFn(() => {
    getMaximizedState().then(v => isMaximized.value = v);
  }, 100));

  return {isMaximized};
}
