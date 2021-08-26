<script lang="ts" setup>
import {ref} from 'vue';
import {useElectron} from '/@/use/electron';
import type {ShikiUser} from '/@/utils/shikimori-api';
import {clearCredentials, getAuthUrl, getUser, refreshCredentials} from '/@/utils/shikimori-api';
import {showErrorMessage} from '/@/utils/dialogs';
import {useRouter} from 'vue-router';


const {openURL} = useElectron();
const login = () => openURL(getAuthUrl());

const isLoading = ref(true);
const profile = ref<ShikiUser | null>(null);

const updateName = async () => {
  isLoading.value = true;
  try {
    profile.value = await getUser();
  } finally {
    isLoading.value = false;
  }
};

const code = new URL(location.href).searchParams.get('code') || '';
if (code) {
  const router = useRouter();
  router.replace({query: {}});
  refreshCredentials({type: 'authorization_code', code})
    .then(() => {
      updateName();
    })
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
    });
} else {
  updateName();
}

const logOut = () => {
  clearCredentials();
  profile.value = null;
};
</script>

<template>
  <section class="card p-3">
    <p>
      Если вы подключите ваш аккаунт Шикимори, то прогресс просмотра В этом приложении будет автоматически
      синхронизироваться с вашими списками на Шикимори
    </p>
    <p class="d-flex flex-row-reverse gap-2 align-items-center">
      <template v-if="profile">
        <button
          class="btn btn-danger"
          @click="logOut"
        >
          Отключить
        </button>
        <span>
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
