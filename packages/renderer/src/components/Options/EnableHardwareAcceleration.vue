<template>
  <div class="form-check">
    <input
      id="enable-hardware-acceleration"
      v-model="enable"
      class="form-check-input"
      type="checkbox"
      aria-describedby="enable-hardware-acceleration-help"
    >
    <label
      class="form-check-label"
      for="enable-hardware-acceleration"
    >
      Включить рендеринг на видеокарте
    </label>
    <p
      id="enable-hardware-acceleration-help"
      class="form-text"
    >
      В редких случаях загрузка превью для таймлайна видео приводит к прерывистому зависанию приложения во время просмотра видео в высоком качестве.
      В зависимости от вашей системы этот параметр может решить эту проблему в ущерб автономности.
    </p>
    <p
      v-if="showNotice"
      class="form-text text-danger"
    >
      Эти изменения вступят в силу после перезагрузки приложения.
    </p>
  </div>
</template>

<script lang="ts">
import {computed, defineComponent, ref} from 'vue';
import {createIpcClient} from '/@/ipc';


export default defineComponent({
  name: 'EnableHardwareAcceleration',
  setup() {
    const userSettings = createIpcClient('UserSettingsController');

    const _enable = ref(false);
    const enable = computed({
      get() {
        return _enable.value;
      },
      set(value: boolean) {
        _enable.value = value;
        userSettings.set('enable_hardware_acceleration', value);
      },
    });

    let origValue = ref();

    userSettings.get('enable_hardware_acceleration').then(value => {
      origValue.value = !!value;
      _enable.value = !!value;
    });

    const showNotice = computed(() => {
      return enable.value !== origValue.value && origValue.value !== undefined;
    });

    return {enable, showNotice};
  },
});
</script>
