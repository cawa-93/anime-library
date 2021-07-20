<template>
  <main>
    <div class="container p-3">
      <option-anime365 />
      <shiki-oauth class="my-3" />

      <section class="card mt-5">
        <p class="card-header">
          Настройки видеоплеера
        </p>
        <p class="card-body mb-0">
          <timeline-thumbnails />
        </p>
      </section>

      <section class="card mt-5">
        <p class="card-header">
          Тема приложения
        </p>
        <p class="card-body mb-0">
          <color-scheme />
        </p>
      </section>


      <section class="card mt-5">
        <p class="card-header">
          О приложении
        </p>
        <p class="card-body mb-0">
          Версия: <strong>{{ appVersion }}</strong>
          <br>
          Исходный код на GitHub:
          <a
            href="#"
            @click.prevent="openGitHub()"
          >cawa-93/anime-library</a>
          <br>
          Сообщество пользователей в
          <a
            href="#"
            @click.prevent="openVK"
          >Вконтакте</a> и в
          <a
            href="#"
            @click.prevent="openTG"
          >Telegram</a>
        </p>
      </section>
    </div>
  </main>
</template>

<script lang="ts">
import {computed, defineComponent, ref} from 'vue';
import {onClickOutside, useTitle} from '@vueuse/core';
import {getAccessToken, saveAccessToken} from '/@/utils/videoProvider/providers/anime365';
import ShikiOauth from '/@/components/ShikiOauth.vue';
import OptionAnime365 from '/@/components/OptionAnime365.vue';
import {openGitHub, openTG, openVK} from '/@/use/socialLinks';
import TimelineThumbnails from '/@/components/Options/TimelineThumbnails.vue';
import ColorScheme from '/@/components/Options/ColorScheme.vue';


export default defineComponent({
  name: 'OptionsPage',
  components: {ColorScheme, TimelineThumbnails, OptionAnime365, ShikiOauth},
  setup() {
    //
    // Заголовок страницы
    useTitle('Параметры');

    const helpDialog = ref<HTMLDialogElement>();
    onClickOutside(helpDialog, () => {
      if (helpDialog.value) {
        helpDialog.value.open = false;
      }
    });

    const openDialog = () => {
      if (helpDialog.value) {
        helpDialog.value.open = true;
      }
    };

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

    const appVersion = import.meta.env.VITE_APP_VERSION;

    return {
      helpDialog,
      openGitHub,
      openVK,
      openTG,
      jsonData,
      parsedAccessToken,
      saveAccessTokenOption,
      SmAccessToken,
      openDialog,
      appVersion,
    };
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
