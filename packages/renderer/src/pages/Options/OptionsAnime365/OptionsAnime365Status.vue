<script lang="ts" setup>
import {getAccessToken} from '/@/utils/videoProvider/providers/anime365/anime365';
import {useElectron} from '/@/use/electron';


const isConnected = !!getAccessToken();
const {openURL} = useElectron();
</script>

<template>
  <div>
    <p class="mb-4">
      Все аниме в этом приложении загружаются с сайта
      <a
        class="underline"
        href=""
        @click.prevent="openURL('https://smotret-anime.online')"
      >Anime.365</a>.
      А он требует для просмотра наличие аккаунта и оплаченной
      <a
        class="underline"
        href=""
        @click.prevent="openURL('https://smotret-anime.online/support/index')"
      >премиум подпиской</a>.
      Без этого вы не сможете наслаждаться аниме ни на самом сайте Anime.365 ни в этом приложении 😓.
    </p>

    <p>
      В настоящий момент ваш аккаунт Anime365:
      <strong :class="[isConnected ? 'text-green-500' : 'text-red-500']">{{
        isConnected ? 'Подключен' : 'Не Подключен'
      }}</strong>.
    </p>
    <p v-if="!isConnected">
      Выполните два простых шага чтобы подключить ваш аккаунт.
    </p>
  </div>
</template>
