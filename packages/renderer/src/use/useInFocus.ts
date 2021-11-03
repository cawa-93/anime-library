import {ref} from 'vue';
import {useEventListener} from '@vueuse/core';


export function useInFocus() {
    const inFocus = ref(true);

    useEventListener(window, 'focus', () => inFocus.value = true);
    useEventListener(window, 'blur', () => inFocus.value = false);
    return {inFocus};
}
