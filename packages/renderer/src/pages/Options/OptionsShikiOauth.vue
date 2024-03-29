<script lang="ts" setup>
import {ref} from 'vue';
import type {ShikiUser} from '/@/utils/shikimori-api';
import {clearCredentials, getAuthUrl, getUser, isLoggedIn, refreshCredentials} from '/@/utils/shikimori-api';
import {useRouter} from 'vue-router';
import {unknownToString} from '/@/utils/unknownToString';
import ButtonSpinner from '/@/components/ButtonSpinner.vue';
import ExternalLink from '/@/components/ExternalLink.vue';


const isShikimoriCredentialsExist = ref(isLoggedIn());
const updateShikiLoggedState = () => isShikimoriCredentialsExist.value = isLoggedIn();

const isLoading = ref(false);
const profile = ref<ShikiUser | null>(null);

const error = ref<string | null>(null);
const authURL = getAuthUrl();
const logOut = () => {
  clearCredentials();
  profile.value = null;
  updateShikiLoggedState();
};

/**
 * Загрузка доанных аккаунта выполняется асинхронно
 */
(async () => {
  /**
   * Код авторизации полученный от Шикимори OAuth
   */
  const code = new URL(location.href).searchParams.get('code') || '';

  // Если был передан код -- обновить access_token
  if (code) {
    const router = useRouter();
    await router.replace({query: {}});

    isLoading.value = true;

    try {
      await refreshCredentials({type: 'authorization_code', code});
    } catch (e) {
      console.error(e);
      error.value = unknownToString(e);
    }

    updateShikiLoggedState();
    isLoading.value = false;
  }

  if (isShikimoriCredentialsExist.value) {
    isLoading.value = true;
    try {
      profile.value = await getUser();
    } catch (e) {
      console.error(e);
      error.value = unknownToString(e);
    }

    isLoading.value = false;
  }

})();

</script>

<template>
  <div class="grid gap-2 grid-cols-[auto,1fr] items-center">
    <p class="col-span-full">
      Если вы подключите ваш аккаунт Шикимори, то прогресс просмотра в этом приложении будет автоматически
      синхронизироваться с вашими списками на Шикимори.
    </p>
    <p
      v-if="error"
      class="text-red-600 dark:text-red-400 col-span-full"
    >
      Ошибка подключения к Шикимори:
      <code>
        {{ error }}
      </code>
    </p>
    <template v-if="isShikimoriCredentialsExist">
      <button
        class="btn bg-red"
        @click="logOut"
      >
        Отключить
      </button>
      <span v-if="profile">
        Подключенный аккаунт:
        <external-link
          class="font-semibold underline"
          :href="profile.url"
        >{{ profile.nickname }}</external-link>
      </span>
    </template>
    <external-link
      v-else
      class="btn btn-outline"
      :class="{
        '!cursor-wait': isLoading
      }"
      :disabled="isLoading"
      :href="authURL"
    >
      <button-spinner v-if="isLoading" />
      Подключить аккаунт Шикимори
    </external-link>
  </div>
</template>
