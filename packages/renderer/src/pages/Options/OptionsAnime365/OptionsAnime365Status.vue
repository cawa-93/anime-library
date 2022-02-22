<script lang="ts" setup>
import ExternalLink from '/@/components/ExternalLink.vue';
import {ANIME365_ORIGIN} from '/@/utils/videoProvider/providers/anime365/utils';
import Anime365SubscribeStatus from '/@/pages/Options/OptionsAnime365/Anime365SubscribeStatus.vue';</script>

<template>
  <div>
    <p class="mb-4">
      Все аниме в этом приложении загружаются с сайта
      <external-link
        class="underline"
        :href="ANIME365_ORIGIN"
      >
        Anime.365
      </external-link>
      .
      А он требует для просмотра наличие аккаунта и оплаченной
      <external-link
        class="underline"
        :href="`${ANIME365_ORIGIN}/support/index`"
      >
        премиум подпиской
      </external-link>
      .
      Без этого вы не сможете наслаждаться аниме ни на самом сайте Anime.365 ни в этом приложении 😓.
    </p>

    <anime365-subscribe-status />
  </div>
</template>
