<script lang="ts" setup>
import {computed, ref} from 'vue';
import EnableHardwareAcceleration from '/@/pages/Options/OptionsEnableHardwareAcceleration.vue';
import {
  isEnabled as isThumbnailsEnabled,
  setEnabled as setThumbnailsEnabled,
} from '/@/pages/Options/settingTimelineThumbnails';
import {setEnabled as setHardwareAccelerationEnabled} from '/@/pages/Options/settingHardwareAcceleration';


const _enable = ref(isThumbnailsEnabled());
const enable = computed({
  get() {
    return _enable.value;
  },
  set(value: boolean) {
    _enable.value = value;
    setThumbnailsEnabled(value);
    if (!value) {
      setHardwareAccelerationEnabled(false);
    }
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

  <enable-hardware-acceleration
    v-if="enable"
    class="mt-3 ml-4"
  />
</template>
