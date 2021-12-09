<script lang="ts" setup>
import ExternalLink from '/@/components/ExternalLink.vue';
import {ANIME365_ORIGIN} from '/@/utils/videoProvider/providers/anime365/utils';
</script>

<template>
  <p class="mb-2">
    Откройте страницу авторизации в вашем браузере
    <external-link
      class="underline"
      :href="`${ANIME365_ORIGIN}/users/login`"
    >
      {{ ANIME365_ORIGIN }}
    </external-link>
    и авторизуйтесь. Если вы уже авторизованы — можете перейти к следующему шагу.
  </p>
  <p>
    <strong>Важно</strong>: вы должны авторизоваться в аккаунте в котором оформлена
    <external-link
      class="underline"
      :href="`${ANIME365_ORIGIN}/support/index`"
    >
      премиум подписка
    </external-link>.
  </p>
</template>

<style scoped>
.btn {
  @apply border-accent border-t border-b border-l last:border-r not-first:rounded-l-none not-last:rounded-r-none;
}
</style>
