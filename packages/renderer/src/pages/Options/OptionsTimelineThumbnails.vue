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
  <div class="form-check">
    <input
      id="enable-timeline-thumbnails"
      v-model="enable"
      class="form-check-input"
      type="checkbox"
      aria-describedby="enable-hardware-acceleration-help"
    >
    <label
      class="form-check-label"
      for="enable-timeline-thumbnails"
    >
      Отображать превью при наведении на таймлайн видео
    </label>
    <p
      id="enable-timeline-thumbnails-help"
      class="form-text"
    >
      В некоторых случаях эта функция может сильно повлиять на скорость загрузки видео, поэтому она выключена
      по-умолчанию.
    </p>
    <enable-hardware-acceleration v-if="enable" />
  </div>
</template>
