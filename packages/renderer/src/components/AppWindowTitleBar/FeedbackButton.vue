<template>
  <div
    class="position-relative btn rounded-0 py-0 border-0 text-primary title-bar-github-link text-truncate d-sm-inline-flex d-none align-items-center justify-content-center "
  >
    <small>
      {{ selectedVariant }}
    </small>

    <select
      :aria-label="selectedVariant"
      class="position-absolute top-0 left-0 w-100 h-100"
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

<script lang="ts">
import {defineComponent} from 'vue';
import {openGitHub, openTG, openVK} from '/@/use/socialLinks';
import {trackEvent} from '/@/utils/telemetry';


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

export default defineComponent({
  name: 'FeedbackButton',
  setup() {

    const textVariants = [
      '🐞 Сообщить о проблеме',
      '💡 Поделится идеей',
      '❔ Задать вопрос',
      '👍🏻 Похвалить приложение',
      '👎🏻 Раскритиковать приложение',
    ];

    const selectedVariant = textVariants[Math.floor(Math.random() * textVariants.length)];

    const onSelected = (event: Event) => {
      const select = event.target;

      if (!select || !(select instanceof HTMLSelectElement)) {
        throw new Error('Expected event with event.target as HTMLSelectElement');
      }

      const socialTarget = select.value as typeof SELECT_OPTIONS[number]['id'];
      switch (socialTarget) {
        case 'vk':
          openVK();
          break;
        case 'telegram':
          openTG();
          break;
        case 'github':
          openGitHub('discussions');
          break;
      }

      // Нужно сбросить значение,
      // чтобы при повторном выборе того же элемента сработало событие `input`
      select.value = '';

      trackEvent('New Issue', 'Click Title bar link', selectedVariant);
    };

    return {onSelected, selectedVariant, SELECT_OPTIONS};
  },
});
</script>

<style scoped>
@import "base-titlebar-button.css";

select {
  opacity: 0;
  cursor: pointer;
}

.btn:focus-within {
  box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
}
</style>
