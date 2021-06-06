import type {Ref} from 'vue';
import {ref} from 'vue';
import {useEventListener} from '@vueuse/core';
import {isMaximized as getMaximizedState} from '/@/utils/window-controllers';

export function isWindowMaximized(defaultValue = false): { isMaximized: Ref<boolean>, forceUpdate(): Promise<boolean> } {
  const isMaximized = ref(defaultValue);
  const forceUpdate = () => getMaximizedState().then(v => isMaximized.value = v);

  forceUpdate().catch(console.error);

  useEventListener(window, 'resize', forceUpdate);

  return {isMaximized, forceUpdate};
}
