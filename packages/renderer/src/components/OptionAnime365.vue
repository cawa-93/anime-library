<template>
  <form
    class="card"
    @submit.prevent="saveAccessTokenOption"
  >
    <div class="card-body">
      <p>
        Для доступа к видео необходимо подключить ваш аккаунт видео-провайдера
        <a
          href="https://smotret-anime.online/users/login"
          @click.prevent="openExternal"
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
          href="https://smotret-anime.online/api/accessToken?app=play-shikimori-online"
          @click.prevent="openExternal"
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
    </div>
  </form>
</template>

<script lang="ts">
import {defineComponent, ref} from 'vue';
import {
  clearAccessToken,
  getAccessToken,
  isFailureResponse,
  saveAccessToken,
} from '/@/utils/videoProvider/providers/anime365';
import {openExternalElement} from '/@/use/openExternal';
import type {ApiResponse} from '/@/utils/videoProvider/providers/anime365-interfaces';
import {showErrorMessage} from '/@/utils/dialogs';
import {getVideos} from '/@/utils/videoProvider';


export default defineComponent({
  name: 'OptionAnime365',
  setup() {


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
              message: typeof e === 'string' ? e : e.message || JSON.stringify(e),
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
            await getVideos(2825677);
          } catch (e) {
            await showErrorMessage({
              title: 'Не удалось проверить валидность ключа',
              message: typeof e === 'string' ? e : e.message || JSON.stringify(e),
            });
          }
        }
      } catch (e) {
        await showErrorMessage({
          title: 'Не удалось сохранить Ключ. Произошла непредвиденная ошибка',
          message: typeof e === 'string' ? e : e.message || JSON.stringify(e),
        });
      } finally {
        isLoading.value = false;
      }


      // try {
      //   const json: ApiResponse<{ access_token: string }> = JSON.parse(SmAccessToken.value);
      //   if (isFailureResponse(json)) {
      //     await showErrorMessage({
      //       title: 'Ключ доступа не верный',
      //       message: json.error.message === 'Authorization required.'
      //           ? 'Вы должны авторизоваться на Anime.365 в том же браузере в котором получаете ключ.'
      //           : json.error.message,
      //     });
      //   } else {
      //     const access_token = json.data.access_token;
      //
      //     if (access_token) {
      //
      //       const originValue = getAccessToken();
      //       saveAccessToken(access_token);
      //
      //       // Попытка выполнить запрос
      //       try {
      //         await getVideos(2825677);
      //       } catch (e) {
      //         saveAccessToken(originValue);
      //         await showErrorMessage({
      //           title: 'Ключ доступа не верный',
      //           message: e.message,
      //         });
      //       }
      //     }
      //   }
      //   } catch (e) {
      //   const originValue = getAccessToken();
      //   saveAccessToken(SmAccessToken.value);
      //
      //   // Попытка выполнить запрос
      //   try {
      //     await getVideos(2825677);
      //   } catch (e) {
      //     saveAccessToken(originValue);
      //     await showErrorMessage({
      //       title: 'Ключ доступа не верный',
      //       message: e.message,
      //     });
      //   }
      //
      // }


      isLoading.value = false;
    };

    return {openExternal: openExternalElement, SmAccessToken, saveAccessTokenOption, isLoading};
  },
});
</script>

<style scoped>

</style>
