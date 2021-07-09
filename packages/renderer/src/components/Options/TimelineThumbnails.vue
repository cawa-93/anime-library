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
      В некоторых случаях эта функция может сильно повлиять на скорость загрузки видео, поэтому она выключена по-умолчанию.
    </p>
    <enable-hardware-acceleration v-if="enable" />
  </div>
</template>

<script lang="ts">
import {computed, defineComponent, ref} from 'vue';
import EnableHardwareAcceleration from '/@/components/Options/EnableHardwareAcceleration.vue';
import {createIpcClient} from '/@/ipc';

const LOCALSTORAGE_KEY = 'enable_timeline_thumbnails';

export const isEnabled = (): boolean => localStorage.getItem(LOCALSTORAGE_KEY) === 'true';

export default defineComponent({
  name: 'TimelineThumbnails',
  components: {EnableHardwareAcceleration},
  setup() {
    const userSettings = createIpcClient('UserSettingsController');

    const _enable = ref(isEnabled());
    const enable = computed({
      get() {
        return _enable.value;
      },
      set(value: boolean) {
        _enable.value = value;
        localStorage.setItem(LOCALSTORAGE_KEY, String(value));
        if (!value) {
          userSettings.set('enable_hardware_acceleration', value);
        }
      },
    });

    return {enable};
  },
});
</script>
