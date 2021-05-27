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
import {clearAccessToken, getAccessToken, saveAccessToken} from '/@/utils/videoProvider/providers/anime365';
import {openExternalElement} from '/@/use/openExternal';


export default defineComponent({
  name: 'OptionAnime365',
  setup() {


    const SmAccessToken = ref(getAccessToken() || '');


    const isLoading = ref(false);
    const saveAccessTokenOption = async () => {
      isLoading.value = true;

      if (SmAccessToken.value.trim()) {
        try {
          const access_token = JSON.parse(SmAccessToken.value).data.access_token;

          if (access_token) {
            saveAccessToken(access_token);
            SmAccessToken.value = access_token;
          }
        } catch (e) {
          saveAccessToken(SmAccessToken.value);
        }
      } else {
        SmAccessToken.value = '';
        clearAccessToken();
      }

      isLoading.value = false;
    };

    return {openExternal: openExternalElement, SmAccessToken, saveAccessTokenOption, isLoading};
  },
});
</script>

<style scoped>

</style>
