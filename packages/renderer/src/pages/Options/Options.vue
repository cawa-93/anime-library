<template>
  <main>
    <div class="container p-3">
      <div class="row">
        <div class="col-md-auto">
          <nav
            class="list-group position-sticky my-3"
            style="top:4.3rem"
          >
            <a
              class="list-group-item list-group-item-action"
              href="#connections"
            >Подключене аккаунтов</a>

            <a
              class="list-group-item list-group-item-action"
              href="#app-settings"
            >Настройки приложения</a>

            <a
              class="list-group-item list-group-item-action"
              href="#help"
            >Справка</a>
          </nav>
        </div>
        <div class="col">
          <h2 id="connections">
            Подключене аккаунтов
          </h2>
          <option-anime365 class="my-3" />
          <shiki-oauth class="my-3" />

          <h2
            id="app-settings"
            class="mt-4"
          >
            Настройки приложения
          </h2>
          <section class="card my-3">
            <p class="card-header">
              Настройки видеоплеера
            </p>
            <p class="card-body mb-0">
              <timeline-thumbnails />
            </p>
          </section>

          <section class="card my-3">
            <p class="card-header">
              Тема приложения
            </p>
            <p class="card-body mb-0">
              <color-scheme />
            </p>
          </section>


          <h2
            id="help"
            class="mt-4"
          >
            Справка
          </h2>
          <section class="card my-3">
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
      </div>
    </div>
  </main>
</template>

<script lang="ts">
import {computed, defineComponent, ref} from 'vue';
import {onClickOutside, useTitle} from '@vueuse/core';
import {getAccessToken, saveAccessToken} from '/@/utils/videoProvider/providers/anime365/anime365';
import ShikiOauth from '/@/pages/Options/OptionsShikiOauth.vue';
import OptionAnime365 from '/@/pages/Options/OptionsAnime365.vue';
import {openGitHub, openTG, openVK} from '/@/use/socialLinks';
import TimelineThumbnails from '/@/pages/Options/OptionsTimelineThumbnails.vue';
import ColorScheme from '/@/pages/Options/OptionsColorScheme.vue';


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
