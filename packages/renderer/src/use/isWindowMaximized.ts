import type {Ref} from 'vue';
import { ref} from 'vue';
import {useElectron} from '/@/use/electron';

export function isWindowMaximized(defaultValue = false): { isMaximized: Ref<boolean> } {
  const {onMaximizeChange} = useElectron();
  const isMaximized = ref(defaultValue);

  onMaximizeChange((state) => isMaximized.value = state);

  return {isMaximized};
}
