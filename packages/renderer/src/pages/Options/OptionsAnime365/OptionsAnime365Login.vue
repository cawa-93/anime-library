<script lang="ts" setup>
import ExternalLink from '/@/components/ExternalLink.vue';
</script>

<template>
  <p class="mb-2">
    Откройте страницу авторизации в вашем браузере
    <external-link
      class="underline"
      href="https://smotret-anime.online/users/login"
    >
      smotret-anime.online
    </external-link>
    и авторизуйтесь. Если вы уже авторизованы — можете перейти к следующему шагу.
  </p>
  <p>
    <strong>Важно</strong>: вы должны авторизоваться в аккаунте в котором оформлена
    <external-link
      class="underline"
      href="https://smotret-anime.online/support/index"
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
