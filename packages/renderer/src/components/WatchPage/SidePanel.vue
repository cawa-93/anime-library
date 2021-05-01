<template>
  <section
    :class="{open: isOpened}"
  >
    <slot />
  </section>
</template>

<script lang="ts">
import {defineComponent} from 'vue';

export default defineComponent({
  name: 'SidePanel',
  props: {
    isOpened: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
});
</script>

<style scoped>
section {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  transform: translateX(100%);
  transition: transform 150ms;
  z-index: 10;
  min-width: 300px;
  -webkit-backdrop-filter: blur(10px);
  backdrop-filter: blur(10px);
  background-color: rgba(255, 255, 255, 0.7);
}

section.open {
  transform: translateX(0);
}
</style>
