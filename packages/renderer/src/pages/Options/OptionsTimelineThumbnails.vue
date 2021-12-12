<script lang="ts" setup>
import {computed, ref} from 'vue';
import {
  isEnabled as isThumbnailsEnabled,
  setEnabled as setThumbnailsEnabled,
} from '/@/pages/Options/settingTimelineThumbnails';


const _enable = ref(isThumbnailsEnabled());
const enable = computed({
  get() {
    return _enable.value;
  },
  set(value: boolean) {
    _enable.value = value;
    setThumbnailsEnabled(value);
  },
});
</script>

<template>
  <label>
    <input
      v-model="enable"
      type="checkbox"
      aria-describedby="enable-timeline-thumbnails-help"
    >
    Отображать превью при наведении на тайм лайн видео
  </label>

  <p
    id="enable-timeline-thumbnails-help"
    class="text-sm opacity-60 ml-4"
  >
    В некоторых случаях эта функция может сильно повлиять на скорость загрузки видео, поэтому она выключена
    по-умолчанию.
  </p>
</template>
