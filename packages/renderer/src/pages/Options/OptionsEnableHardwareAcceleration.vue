<script lang="ts" setup>
import {computed, ref} from 'vue';
import {isEnabled, setEnabled} from '/@/pages/Options/settingHardwareAcceleration';


const _enable = ref(false);
const enable = computed({
  get() {
    return _enable.value;
  },
  set(value: boolean) {
    _enable.value = value;
    setEnabled(value);
  },
});

let origValue = ref();

isEnabled().then(value => {
  origValue.value = value;
  _enable.value = value;
});

const showNotice = computed(() => {
  return enable.value !== origValue.value && origValue.value !== undefined;
});
</script>

<template>
  <div>
    <label>
      <input
        v-model="enable"
        type="checkbox"
        aria-describedby="enable-hardware-acceleration-help"
      >
      Включить рендеринг на видеокарте
    </label>

    <p
      id="enable-hardware-acceleration-help"
      class="text-sm opacity-60 ml-4"
    >
      В редких случаях загрузка превью для тайм лайна видео приводит к прерывистому зависанию приложения во время
      просмотра видео в высоком качестве.
      В зависимости от вашей системы этот параметр может решить эту проблему в ущерб автономности.
    </p>
    <p
      v-if="showNotice"
      class="ml-4 text-sm text-red-500"
    >
      Эти изменения вступят в силу после перезагрузки приложения.
    </p>
  </div>
</template>
