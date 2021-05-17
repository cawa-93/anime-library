<template>
  <form
    @submit.prevent="saveAccessTokenOption"
  >
    <label>
      Ключ доступа к Anime.365<br>
      <input
        v-model="SmAccessToken"
        required
        type="text"
      >
    </label>
    <p>
      <a
        class="help-text"
        @click="helpDialog.open = true"
      >
        Как получить ключ доступа?
      </a>
    </p>
    <button type="submit">
      Сохранить
    </button>
  </form>


  <dialog ref="helpDialog">
    <ol>
      <li>
        Авторизуйтесь в браузере на сайте:
        <a
          href="https://smotret-anime.online/users/login"
          @click.prevent="openExternal"
        >
          Anime.365
        </a>
      </li>
      <li>
        Скопируйте в поле ниже код полученный по
        <a
          href="https://smotret-anime.online/api/accessToken?app=play-shikimori-online"
          @click.prevent="openExternal"
        >
          этой ссылке
        </a>
      </li>

      <li>
        <label>
          Введите текст от Anime.365:<br>
          <textarea
            v-model="jsonData"
            autofocus
            cols="30"
            rows="10"
          />
        </label>
      </li>
      <li>
        <label>
          Ваш ключ доступа:<br>
          <input
            :value="parsedAccessToken"
            type="text"
            readonly
          >
        </label>
      </li>
    </ol>
  </dialog>
</template>

<script lang="ts">
import {computed, defineComponent, ref} from 'vue';
import {useElectron} from '/@/use/electron';
import {onClickOutside} from '@vueuse/core';
import {getAccessToken, saveAccessToken} from '/@/utils/videoProvider/providers/anime365';

export default defineComponent({
  name: 'OptionsPage',
  setup() {
    const helpDialog = ref<HTMLDialogElement>();
    onClickOutside(helpDialog, () => {
      if (helpDialog.value) {
        helpDialog.value.open = false;
      }
    });

    const {openURL} = useElectron();
    const openExternal = (event: MouseEvent) => openURL(event.target?.href);

    const jsonData = ref('');
    const parsedAccessToken = computed(() => {
      try {
        return JSON.parse(jsonData.value).data.access_token;
      } catch {
        return '';
      }
    });

    const SmAccessToken = ref(getAccessToken() || '');
    const saveAccessTokenOption = () => saveAccessToken(SmAccessToken.value);

    return {helpDialog, openExternal, jsonData, parsedAccessToken, saveAccessTokenOption, SmAccessToken};
  },
});
</script>

<style scoped>
dialog::backdrop {
  background-color: red;
}

dialog ol {
  padding-inline-end: 40px;
}

dialog textarea, dialog input {
  width: 100%;
}

a.help-text {
  text-decoration: underline dotted gray;
  cursor: help;
}
</style>
