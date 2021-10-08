<script lang="ts" setup>
import {computed, ref} from 'vue';
import type * as sm from '/@/utils/videoProvider/providers/anime365/anime365-interfaces';
import {getAccessToken, saveAccessToken} from '/@/utils/videoProvider/providers/anime365/anime365';
import {useTokenValidator} from '/@/pages/Options/OptionsAnime365/useTokenValidator';
import ButtonSpinner from '/@/components/ButtonSpinner.vue';
import ExternalLink from '/@/components/ExternalLink.vue';
import {isFailureResponse} from '/@/utils/videoProvider/providers/anime365/utils';


const emit = defineEmits({
  'save': null,
});

const inputStrValue = ref(getAccessToken() || '');

interface Token {
  access_token: string;
}


const inputObjValue = computed<string | sm.ApiResponseFailure | sm.ApiResponseSuccess<Token>>(() => {
  const input = inputStrValue.value.trim();

  /**
   * Пользователь может вставить как значение `access_token`
   * Так и весь JSON ответ целиком
   */
  if (input.includes('{')) {
    return JSON.parse(input);
  }

  return input;
});

const errorMessage = computed(() => {
  if (typeof inputObjValue.value === 'string') {
    return '';
  }

  if (isFailureResponse(inputObjValue.value)) {
    return inputObjValue.value.error.message === 'Authorization required.'
      ? 'Сначала вы должны авторизоваться'
      : inputObjValue.value.error.message;
  }

  return '';
});

const token = computed(() =>
  typeof inputObjValue.value === 'string'
    ? inputObjValue.value
    : (inputObjValue.value as sm.ApiResponseSuccess<Token>).data.access_token || '',
);

const {isValid, isLoading, check} = useTokenValidator(token);


const save = () => {
  if (isValid.value === true || isValid.value === undefined) {
    saveAccessToken(token.value ? token.value : null);
    emit('save');
  }
};
</script>

<template>
  <form
    class="grid grid-cols-[min-content,auto,1fr] auto-rows-auto gap-3 items-center"
    @submit.prevent="save"
  >
    <p class="col-span-full">
      <external-link
        class="font-bold underline"
        href="https://smotret-anime.online/api/accessToken?app=play-shikimori-online"
      >
        Нажмите сюда
      </external-link>
      ,
      скопируйте полученный от сайта ключ и вставьте его в поле ниже.
    </p>

    <label class="col-span-full flex gap-3 items-center">
      Ключ:
      <input
        v-model="inputStrValue"
        type="text"
      >
    </label>

    <p
      v-if="errorMessage"
      class="text-sm text-red-500"
    >
      {{ errorMessage }}
    </p>

    <button
      class="btn bg-accent"
      type="submit"
      :disabled="errorMessage !== ''"
    >
      Сохранить
    </button>
    <button
      class="btn btn-outline"
      type="button"
      :disabled="token === '' || errorMessage !== '' || isValid !== undefined || isLoading"
      @click="check"
    >
      <button-spinner v-if="isLoading" />
      Проверить
    </button>

    <p
      v-if="isValid !== undefined"
      :class="{
        'text-red-500': !isValid,
        'text-green-500': isValid,
      }"
    >
      <span v-if="isValid">✔ Введённый ключ валидный</span>
      <span v-else>
        ❌ Введённый ключ не валидный.
        Возможно вы не авторизованы или авторизованы в аккаунте в котором не оформлена <external-link
          class="underline"
          href="https://smotret-anime.online/support/index"
        >премиум подписка</external-link>.
      </span>
    </p>
  </form>
</template>
