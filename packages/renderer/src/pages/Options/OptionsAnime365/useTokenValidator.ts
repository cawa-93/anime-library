import type {Ref} from 'vue';
import {ref, unref, watch} from 'vue';
import {tryOnBeforeUnmount} from '@vueuse/core';
import {getStream} from '/@/utils/videoProvider/providers/anime365/anime365';
import {showErrorMessage} from '/@/utils/dialogs';
import {isFailureResponse} from '/@/utils/videoProvider/providers/anime365/utils';


const translationForChecking = [
  211735,
  211996,
  399092,
  321272,
  2902397,
  3497923,
  2971044,
  3497839,
];


export function useTokenValidator(token: Ref<string>): { isLoading: Ref<boolean>; isValid: Ref<boolean | undefined>; check: () => Promise<void> } {
  const isLoading = ref(false);
  const isValid = ref<true | false | undefined>(undefined);

  const controller = new AbortController();

  tryOnBeforeUnmount(() => {
    controller.abort();
  });

  watch(token, () => isValid.value = undefined);

  const check = async () => {
    isLoading.value = true;
    isValid.value = undefined;
    const t = unref(token);

    for (const id of translationForChecking) {
      try {
        await getStream(id, t, {signal: controller.signal});
        isValid.value = true;
        isLoading.value = false;
        return;
      } catch (e: unknown) {
        if (isFailureResponse(e) && e?.error?.code === 403) {
          isValid.value = false;
          isLoading.value = false;
          return;
        }
      }
    }

    await showErrorMessage({title: 'Не удалось проверить ключ', message: 'Проверьте соединение с сетью'});
    isLoading.value = false;
  };



  return {isValid, isLoading, check};
}
