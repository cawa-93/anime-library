<script lang="ts" setup>
import {computed, ref} from 'vue';
import type * as sm from '/@/utils/videoProvider/providers/anime365/anime365-interfaces';
import {getAccessToken, saveAccessToken} from '/@/utils/videoProvider/providers/anime365/anime365';
import {ANIME365_ORIGIN, isFailureResponse} from '/@/utils/videoProvider/providers/anime365/utils';
import ExternalLink from '/@/components/ExternalLink.vue';
import Anime365SubscribeStatus from '/@/pages/Options/OptionsAnime365/Anime365SubscribeStatus.vue';


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


const save = () => {
  saveAccessToken(token.value ? token.value : null);
  emit('save');
  savedAccessToken.value = token.value;
};


let savedAccessToken = ref(getAccessToken() || undefined);
</script>

<template>
  <form
    @submit.prevent="save"
  >
    <p class="mb-3">
      <external-link
        class="font-bold underline"
        :href="`${ANIME365_ORIGIN}/api/accessToken?app=play-shikimori-online`"
      >
        Нажмите сюда
      </external-link>
      ,
      скопируйте полученный от сайта ключ и вставьте его в поле ниже.
    </p>

    <p class="field">
      <label class="col-span-full gap-3 items-center">
        Ключ:
      </label>

      <input
        v-model="inputStrValue"
        type="text"
      >

      <button
        class="btn bg-accent"
        type="submit"
        :disabled="errorMessage !== ''"
      >
        Сохранить
      </button>
    </p>

    <p
      v-if="errorMessage"
      class="text-sm text-red-500 mt-3"
    >
      {{ errorMessage }}
    </p>

    <p class="mt-3">
      <anime365-subscribe-status :access-token="savedAccessToken" />
    </p>
  </form>
</template>

<style scoped>
.field {
  display: grid;
  grid-auto-columns: 1fr;
  grid-template-columns: 1fr auto;
  grid-template-rows: repeat(2, auto);
  gap: 0.2rem 0.5rem;
  grid-template-areas:
    "label label"
    "input button";
}

.field label { grid-area: label; }
.field input { grid-area: input; }
.field button { grid-area: button; }
</style>
