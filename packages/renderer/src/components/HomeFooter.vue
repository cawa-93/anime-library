<script lang="ts" setup>
import ExternalLink from '/@/components/ExternalLink.vue';
import {DONATE, GITHUB, TG, VK} from '/@/utils/social-links';</script>


<template>
  <footer class="flex flex-wrap justify-center gap-x-10 gap-y-3 px-3 py-5 card shadow-none rounded-none border-b-0 border-l-0 border-r-0">
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
  </footer>
</template>


<style scoped>

</style>
