<script lang="ts" setup>
import {ref} from 'vue';
import {
  clearAccessToken,
  getAccessToken,
  isFailureResponse,
  saveAccessToken,
} from '/@/utils/videoProvider/providers/anime365/anime365';
import type {ApiResponse} from '/@/utils/videoProvider/providers/anime365/anime365-interfaces';
import {showErrorMessage} from '/@/utils/dialogs';
import {getVideo} from '/@/utils/videoProvider';
import {useElectron} from '/@/use/electron';
import {unknownToString} from '/@/utils/unknownToString';


const {openURL} = useElectron();
const SmAccessToken = ref(getAccessToken() || '');


const isLoading = ref(false);
const saveAccessTokenOption = async () => {

  if (!SmAccessToken.value.trim()) {
    SmAccessToken.value = '';
    clearAccessToken();
    return;
  }

  isLoading.value = true;
  try {

    let access_token: string | null = null;

    // Был вставлен JSON
    if (/[{}]/.test(SmAccessToken.value)) {
      try {
        const json: ApiResponse<{ access_token: string }> = JSON.parse(SmAccessToken.value);

        if (isFailureResponse(json)) {
          await showErrorMessage({
            title: 'Ключ доступа не верный',
            message: json.error.message === 'Authorization required.'
              ? 'Вы должны авторизоваться на Anime.365 в том же браузере в котором получаете ключ.'
              : json.error.message,
          });
        } else {
          access_token = json.data.access_token;
        }
      } catch (e) {
        await showErrorMessage({
          title: 'Проверьте правильность введённых данных',
          message: unknownToString(e),
        });
      }
    }
    // Был вставлен только access_token
    else {
      access_token = SmAccessToken.value;
    }

    /**
     * Если access_token найден -- сохранить его и попробовать выполнить запрос к серверу, чтобы проверить валидность ключа
     */
    if (access_token !== null) {
      try {
        saveAccessToken(access_token);
        /**
         * Чтобы проверить валидность access_token нужно попробовать загрузить видео для какого-то перевода
         * Это ID такого тестового перевода
         */
        const TEST_TRANSLATION_ID = 2825677;
        await getVideo(TEST_TRANSLATION_ID);
      } catch (e) {
        await showErrorMessage({
          title: 'Не удалось проверить валидность ключа',
          message: unknownToString(e),
        });
      }
    }
  } catch (e) {
    await showErrorMessage({
      title: 'Не удалось сохранить Ключ. Произошла непредвиденная ошибка',
      message: unknownToString(e),
    });
  } finally {
    isLoading.value = false;
  }

  isLoading.value = false;
};
</script>

<template>
  <form @submit.prevent="saveAccessTokenOption">
    <p>
      Для доступа к видео необходимо подключить ваш аккаунт видео-провайдера
      <a
        href="#"
        @click.prevent="openURL('https://smotret-anime.online/users/login')"
      >Anime.365</a>.
    </p>
    <label
      for="anime365-access-token"
      class="form-label"
    >Ключ доступа к Anime.365</label>
    <input
      id="anime365-access-token"
      v-model="SmAccessToken"
      :disabled="isLoading"
      type="password"
      class="form-control"
      aria-describedby="anime365-access-token-help"
    >
    <div
      id="anime365-access-token-help"
      class="form-text"
    >
      Чтобы получить ключ доступа авторизуйтесь в браузере и
      <strong><a
        href="#"
        @click.prevent="openURL('https://smotret-anime.online/api/accessToken?app=play-shikimori-online')"
      >
        перейдите по этой ссылке
      </a>
      </strong>
    </div>
    <div class="d-flex flex-row-reverse">
      <button
        :disabled="isLoading"
        type="submit"
        class="btn btn-success"
      >
        <span
          v-if="isLoading"
          class="spinner-border spinner-border-sm"
          role="status"
          aria-hidden="true"
        />
        Сохранить
      </button>
    </div>
  </form>
</template>
