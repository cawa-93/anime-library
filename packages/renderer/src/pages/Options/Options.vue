<script lang="ts" setup>
import {useTitle} from '@vueuse/core';
import ShikiOauth from '/@/pages/Options/OptionsShikiOauth.vue';
import OptionAnime365 from '/@/pages/Options/OptionsAnime365.vue';
import {openGitHub, openTG, openVK} from '/@/use/socialLinks';
import TimelineThumbnails from '/@/pages/Options/OptionsTimelineThumbnails.vue';
import ColorScheme from '/@/pages/Options/OptionsColorScheme.vue';


useTitle('Параметры');
const appVersion = import.meta.env.VITE_APP_VERSION;
</script>

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
            >Подключение аккаунтов</a>

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
          <section id="connections">
            <h2>
              Подключение аккаунтов
            </h2>
            <option-anime365 class="my-3" />
            <shiki-oauth class="my-3" />
          </section>

          <section id="app-settings">
            <h2 class="mt-4">
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
          </section>


          <section id="help">
            <h2 class="mt-4">
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
      </div>
    </div>
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
