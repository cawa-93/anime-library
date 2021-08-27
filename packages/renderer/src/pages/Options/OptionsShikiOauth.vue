<script lang="ts" setup>
import {ref} from 'vue';
import {useElectron} from '/@/use/electron';
import type {ShikiUser} from '/@/utils/shikimori-api';
import {clearCredentials, getAuthUrl, getUser, isLoggedIn, refreshCredentials} from '/@/utils/shikimori-api';
import {useRouter} from 'vue-router';
import {unknownToString} from '/@/utils/unknownToString';


const {openURL} = useElectron();

const isShikimoriCredentialsExist = ref(isLoggedIn());
const updateShikiLoggedState = () => isShikimoriCredentialsExist.value = isLoggedIn();

const isLoading = ref(false);
const profile = ref<ShikiUser | null>(null);

const error = ref<string | null>(null);
const login = () => openURL(getAuthUrl());
const logOut = () => {
  clearCredentials();
  profile.value = null;
  updateShikiLoggedState();
};


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
  <section class="card p-3">
    <p>
      Если вы подключите ваш аккаунт Шикимори, то прогресс просмотра В этом приложении будет автоматически
      синхронизироваться с вашими списками на Шикимори
    </p>
    <p
      v-if="error"
      class="text-danger"
    >
      Ошибка подключения к Шикимори: {{ error }}
    </p>
    <p class="d-flex flex-row-reverse gap-2 align-items-center">
      <template v-if="isShikimoriCredentialsExist">
        <button
          class="btn btn-danger"
          @click="logOut"
        >
          Отключить
        </button>
        <span v-if="profile">
          Подключенный аккаунт Шикимори:
          <strong><a
            :href="profile.url"
            @click.prevent="() => profile && profile.url && openURL(profile.url)"
          >{{ profile.nickname }}</a></strong>
        </span>
      </template>
      <button
        v-else
        class="btn btn-dark"
        :disabled="isLoading"
        @click="login"
      >
        <span
          v-if="isLoading"
          class="spinner-border spinner-border-sm"
          role="status"
          aria-hidden="true"
        />
        Подключить аккаунт Шикимори
      </button>
    </p>
  </section>
</template>
