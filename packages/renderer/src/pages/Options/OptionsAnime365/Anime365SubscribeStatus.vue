<script lang="ts" setup>

import {asyncComputed} from '@vueuse/core';
import {getSubscribeStatus} from '/@/utils/videoProvider/providers/anime365/getSubscribeStatus';
import {formatDate} from '/@/utils/formatDate';
import {computed, ref} from 'vue';
import ButtonSpinner from '/@/components/ButtonSpinner.vue';


const props = defineProps({
  accessToken: {
    type: String,
    required: false,
    default: undefined,
  },
});

const isLoading = ref(true);
const subscribe = asyncComputed(() => getSubscribeStatus(props.accessToken), null, isLoading);
const premiumUntilFormatted = computed(() => formatDate(
  subscribe.value?.premiumUntil
    ? Date.parse(subscribe.value?.premiumUntil)
    : 0),
);
</script>

<template>
  <template v-if="isLoading">
    <p style="height: 56px">
      <button-spinner />
      Загрузка ...
    </p>
  </template>
  <ul v-else-if="subscribe">
    <li v-if="subscribe.isLogined">
      <span class="win-icon">&#xEC61;</span>Аккаунт подключён
    </li>
    <li v-else>
      <span class="win-icon text-red">&#xEB90;</span>Нет ключа доступа
    </li>

    <li v-if="subscribe.isPremium">
      <span class="win-icon">&#xEC61;</span>Подписка оформлена до {{ premiumUntilFormatted }}
    </li>
    <li v-else>
      <span class="win-icon text-red">&#xEB90;</span>Подписка не оформлена
    </li>
  </ul>
</template>

<style scoped>

li {
  @apply flex gap-2;
  display: flex;
}

.win-icon {
  @apply text-lg;
  color: #268926;
}

.win-icon.text-red {
  color: #c94d3e;
}
</style>
