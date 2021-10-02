<script lang="ts" setup>
import {useTitle} from '@vueuse/core';
import ShikiOauth from '/@/pages/Options/OptionsShikiOauth.vue';
import OptionAnime365 from '/@/pages/Options/OptionsAnime365/OptionsAnime365.vue';
import {openGitHub, openTG, openVK} from '/@/use/socialLinks';
import TimelineThumbnails from '/@/pages/Options/OptionsTimelineThumbnails.vue';
import ColorScheme from '/@/pages/Options/OptionsColorScheme.vue';
import HomeFooter from '/@/components/HomeFooter.vue';
import OptionsAnime365_LEGACY from '/@/pages/Options/OptionsAnime365_LEGACY.vue';


useTitle('Параметры');
const appVersion = import.meta.env.VITE_APP_VERSION;
</script>

<template>
  <main class="grid grid-rows-[1fr,min-content] content-between gap-6">
    <div
      class="grid gap-y-10 gap-x-5 grid-cols-[auto,1fr] auto-rows-min content-between items-start max-w-screen-lg w-full m-auto p-6"
    >
      <nav class="sticky top-2 mt-15 card p-0">
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
        aria-labelledby="connections-head"
      >
        <h2 id="connections-head">
          Подключение аккаунтов
        </h2>

        <section
          class="card border-accent !shadow-accent"
          aria-labelledby="connections-anime365-head"
        >
          <h3
            id="connections-anime365-head"
            class="card-header text-base bg-accent font-bold dark:bg-accent-600"
          >
            Anime.365
          </h3>

          <option-anime365 />
        </section>

        <section
          class="card"
          aria-labelledby="connections-shikimori-head"
        >
          <h3
            id="connections-shikimori-head"
            class="card-header text-base"
          >
            Шикимори
          </h3>

          <shiki-oauth />
        </section>
      </section>

      <section
        id="app-settings"
        class="col-start-2"
        aria-labelledby="app-settings-head"
      >
        <h2 id="app-settings-head">
          Настройки приложения
        </h2>
        <section
          class="card"
          aria-labelledby="video-player-head"
        >
          <h3
            id="video-player-head"
            class="card-header text-base"
          >
            Настройки видеоплейера
          </h3>
          <timeline-thumbnails />
        </section>

        <section
          class="card"
          aria-labelledby="app-theme-head"
        >
          <h3
            id="app-theme-head"
            class="card-header text-base"
          >
            Тема приложения
          </h3>
          <color-scheme aria-labelledby="app-theme-head" />
        </section>
      </section>

      <section
        id="help"
        class="col-start-2"
        aria-labelledby="help-head"
      >
        <h2 id="help-head">
          Справка
        </h2>
        <section
          class="card"
          aria-labelledby="about"
        >
          <h3
            id="about"
            class="card-header text-base"
          >
            О приложении
          </h3>
          <p>
            Версия: <strong>{{ appVersion }}</strong>
            <br>
            Исходный код на GitHub:
            <a
              class="underline"
              href="#"
              @click.prevent="openGitHub()"
            >cawa-93/anime-library</a>
            <br>
            Сообщество пользователей в
            <a
              class="underline"
              href="#"
              @click.prevent="openVK()"
            >Вконтакте</a> и в
            <a
              class="underline"
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

section.card {
  @apply mt-4 shadow-lg;
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
