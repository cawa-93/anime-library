<script lang="ts" setup>
import {trackEvent} from '/@/utils/telemetry';
import {GITHUB, TG_CHAT, VK_CHAT} from '/@/utils/social-links';
import {openExternalURL} from '/@/use/openExternalURL';


const SELECT_OPTIONS = [{
  id: 'telegram',
  label: 'В Telegram',
}, {
  id: 'vk',
  label: 'В VK',
}, {
  id: 'github',
  label: 'На GitHub',
}] as const;


const onSelected = (event: Event) => {
  const select = event.target;

  if (!select || !(select instanceof HTMLSelectElement)) {
    throw new Error('Expected event with event.target as HTMLSelectElement');
  }

  const socialTarget = select.value as typeof SELECT_OPTIONS[number]['id'];
  switch (socialTarget) {
    case 'vk':
      openExternalURL(VK_CHAT);
      break;
    case 'telegram':
      openExternalURL(TG_CHAT);
      break;
    case 'github':
      openExternalURL(GITHUB + '/discussions');
      break;
  }

  // Нужно сбросить значение,
  // чтобы при повторном выборе того же элемента сработало событие `input`
  select.value = '';

  trackEvent('New Issue', 'Click Title bar link', 'Помощь');
};
</script>

<template>
  <div
    class="relative btn-title-bar text-xs"
  >
    Помощь

    <select
      aria-label="Помощь"
      class="absolute top-0 left-0 w-full h-full opacity-0"
      value=""
      @input.prevent="onSelected"
    >
      <option
        v-for="option of SELECT_OPTIONS"
        :key="option.id"
        :value="option.id"
      >
        {{ option.label }}
      </option>
    </select>
  </div>
</template>

<style scoped>
@import "./btn-titlebar.css";
</style>
