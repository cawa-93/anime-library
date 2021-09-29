<script lang="ts" setup>
import {useTitle} from '@vueuse/core';
import ShikiOauth from '/@/pages/Options/OptionsShikiOauth.vue';
import OptionAnime365 from '/@/pages/Options/OptionsAnime365.vue';
import {openGitHub, openTG, openVK} from '/@/use/socialLinks';
import TimelineThumbnails from '/@/pages/Options/OptionsTimelineThumbnails.vue';
import ColorScheme from '/@/pages/Options/OptionsColorScheme.vue';
import HomeFooter from '/@/components/HomeFooter.vue';


useTitle('Параметры');
const appVersion = import.meta.env.VITE_APP_VERSION;
</script>

<template>
  <main class="grid grid-rows-[1fr,min-content] content-between gap-6">
    <div class="grid gap-y-4 gap-x-8 grid-cols-[auto,1fr] auto-rows-min content-between items-start max-w-screen-lg w-full m-auto p-6">
      <nav class="sticky top-8 card p-0">
        <a
          class="btn rounded-none block px-4 py-2 not-first:border-t border-opacity-25 border-black dark:border-white dark:border-opacity-25"
          href="#connections"
        >Подключение аккаунтов</a>
        <a
          class="btn rounded-none block px-4 py-2 not-first:border-t border-opacity-25 border-black dark:border-white dark:border-opacity-25"
          href="#app-settings"
        >Настройки приложения</a>
        <a
          class="btn rounded-none block px-4 py-2 not-first:border-t border-opacity-25 border-black dark:border-white dark:border-opacity-25"
          href="#help"
        >Справка</a>
      </nav>

      <section
        id="connections"
        class="col-start-2"
      >
        <h2>
          Подключение аккаунтов
        </h2>
        <option-anime365 class="my-3" />

        <div class="card">
          <h3 class="card-header text-base">
            Шикимори
          </h3>

          <shiki-oauth />
        </div>
      </section>

      <section
        id="app-settings"
        class="col-start-2"
      >
        <h2>
          Настройки приложения
        </h2>
        <section class="card mt-3">
          <p class="card-header">
            Настройки видеоплейера
          </p>
          <timeline-thumbnails />
        </section>

        <section class="card mt-3">
          <p class="card-header">
            Тема приложения
          </p>
          <color-scheme />
        </section>
      </section>

      <section
        id="help"
        class="col-start-2"
      >
        <h2>
          Справка
        </h2>
        <section class="card mt-3">
          <p class="card-header">
            О приложении
          </p>
          <p>
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
              @click.prevent="openVK()"
            >Вконтакте</a> и в
            <a
              href="#"
              @click.prevent="openTG()"
            >Telegram</a>
          </p>
        </section>
      </section>
    </div>

    <home-footer />
  </main>
</template>


<style scoped>
/**
 * Анимация взята со страницы
 * https://css-tricks.com/snippets/css/shake-css-keyframe-animation/
 */
section:target {
  animation: shake 0.82s cubic-bezier(.36, .07, .19, .97) both;
}

nav a {

}

@keyframes shake {
  10%, 90% {
    transform: translate3d(-1px, 0, 0);
  }

  20%, 80% {
    transform: translate3d(2px, 0, 0);
  }

  30%, 50%, 70% {
    transform: translate3d(-4px, 0, 0);
  }

  40%, 60% {
    transform: translate3d(4px, 0, 0);
  }
}
</style>
