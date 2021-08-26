<script lang="ts" setup>
import {ref} from 'vue';
import {useElectron} from '/@/use/electron';
import type {ShikiUser} from '/@/utils/shikimori-api';
import {clearCredentials, getAuthUrl, getUser, isLoggedIn, refreshCredentials} from '/@/utils/shikimori-api';
import {showErrorMessage} from '/@/utils/dialogs';
import {useRouter} from 'vue-router';


const isShikiLoggedIn = ref(isLoggedIn());

const {openURL} = useElectron();
const login = () => openURL(getAuthUrl());

const isLoading = ref(true);
const profile = ref<ShikiUser | null>(null);

/**
 * Загружает имя подключенного аккаунта
 */
const updateName = async () => {
  isLoading.value = true;
  isShikiLoggedIn.value = isLoggedIn();
  if (isShikiLoggedIn.value) {
    try {
      profile.value = await getUser();
    } catch (e) {
      showErrorMessage({
        title: 'Ошибка авторизации в Shikimori',
        message: typeof e === 'string'
          ? e
          : e.error_description || e.message
            ? e.error_description || e.message
            : JSON.stringify(e),
      });
    } finally {
      isLoading.value = false;
    }
  } else {
    isLoading.value = false;
  }
};

/**
 * Код авторизации полученный от Шикимори OAuth
 */
const code = new URL(location.href).searchParams.get('code') || '';
if (code) {
  const router = useRouter();
  router.replace({query: {}});

  refreshCredentials({type: 'authorization_code', code})
    .then(updateName)
    .catch(e => {
      showErrorMessage({
        title: 'Ошибка авторизации в Shikimori',
        message: typeof e === 'string'
          ? e
          : e.error_description || e.message
            ? e.error_description || e.message
            : JSON.stringify(e),
      });
      console.error(e);
    })
    .finally(() => isLoading.value = false);
} else {
  updateName();
}

const logOut = () => {
  clearCredentials();
  profile.value = null;
  isShikiLoggedIn.value = isLoggedIn();

};
</script>

<template>
  <section class="card p-3">
    <p>
      Если вы подключите ваш аккаунт Шикимори, то прогресс просмотра В этом приложении будет автоматически
      синхронизироваться с вашими списками на Шикимори
    </p>
    <p class="d-flex flex-row-reverse gap-2 align-items-center">
      <template v-if="isShikiLoggedIn">
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
