<script lang="ts" setup>
import ExternalLink from '/@/components/ExternalLink.vue';
import {DONATE, GITHUB, TG, VK} from '/@/utils/social-links';


const appVersion = import.meta.env.VITE_APP_VERSION;
</script>


<template>
  <footer
    class="px-3 py-5 card shadow-none rounded-none border-b-0 border-l-0 border-r-0"
  >
    <nav
      class="m-auto flex flex-wrap w-full max-w-2xl justify-around gap-x-4 gap-y-2"
      aria-label="Ссылки для обратной связи"
    >
      <external-link
        class="border-b-1 border-transparent hover:(border-current opacity-100) opacity-50"
        title="Что нового"
        :href="`https://github.com/cawa-93/anime-library/releases/tag/v${appVersion}`"
      >
        v{{ appVersion }}
      </external-link>

      <external-link
        :href="VK"
        class="border-b-1 border-transparent hover:(border-current opacity-100) opacity-80"
      >
        Вконтакте
      </external-link>

      <external-link
        :href="TG"
        class="border-b-1 border-transparent hover:(border-current opacity-100) opacity-80"
      >
        Телеграм
      </external-link>


      <external-link
        :href="GITHUB"
        class="border-b-1 border-transparent hover:(border-current opacity-100) opacity-80"
      >
        GitHub
      </external-link>

      <external-link
        :href="DONATE"
        class="border-b-1 border-transparent hover:(border-current opacity-100) opacity-80"
      >
        Купить разработчику кофе ☕
      </external-link>
    </nav>
  </footer>
</template>
