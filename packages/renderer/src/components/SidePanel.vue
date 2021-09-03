<template>
  <section ref="el">
    <slot />
  </section>
</template>

<script lang="ts" setup>
import {ref} from 'vue';
import {onClickOutside} from '@vueuse/core';


defineProps({
  isOpened: {
    type: Boolean,
    required: true,
  },
});

const emit = defineEmits({
  'update:isOpened': null,
});

const el = ref();
onClickOutside(el, () => emit('update:isOpened', false));
</script>

<style scoped>

section {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  z-index: 10;
  min-width: 250px;
  -webkit-backdrop-filter: blur(10px);
  backdrop-filter: blur(10px);
  --background-color: 255, 255, 255;
  --background-opacity: 0.75;
  background-color: rgba(var(--background-color), var(--background-opacity));
  height: 100%;
  overflow-y: auto;
  -webkit-app-region: no-drag;
}


@media (prefers-color-scheme: dark) {
  section {
    --background-color: 0, 0, 0;
  }
}
</style>
