<script lang="ts" setup>
import {useElectron} from '/@/use/electron';


const {openURL} = useElectron();
</script>

<template>
  <p>
    Откройте страницу авторизации в вашем браузере
    <a
      class="underline"
      href=""
      @click.prevent="openURL('https://smotret-anime.online/users/login')"
    >smotret-anime.online</a>
    и авторизуйтесь. Если вы уже авторизованы — можете перейти к следующему шагу.
  </p>
  <p>
    <strong>Важно</strong>: вы должны авторизоватся в аккаунте в котором оформлена
    <a
      class="underline"
      href=""
      @click.prevent="openURL('https://smotret-anime.online/support/index')"
    >премиум подписки</a>.
  </p>
</template>

<style scoped>
.btn {
  @apply border-accent border-t border-b border-l last:border-r not-first:rounded-l-none not-last:rounded-r-none;
}
</style>
