<script lang="ts" setup>
import {computed, ref} from 'vue';


const _enable = ref(false);
const enable = computed({
  get() {
    return _enable.value;
  },
  set(value: boolean) {
    _enable.value = value;
    window.hardwareAcceleration.set(value);
  },
});

let origValue = ref();

window.hardwareAcceleration.get().then(value => {
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
      Включить аппаратное ускорение
    </label>

    <p
      id="enable-hardware-acceleration-help"
      class="text-sm opacity-60 ml-4"
    >
      Включите если вы столкнулись с зависаниями видео или интерфейса.
      В зависимости от вашей системы этот параметр может улучшить плавность отрисовки в ущерб автономности.
    </p>
    <p
      v-if="showNotice"
      class="ml-4 text-sm text-red-500"
    >
      Эти изменения вступят в силу после перезагрузки приложения.
    </p>
  </div>
</template>
