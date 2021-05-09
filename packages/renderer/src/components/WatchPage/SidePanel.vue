<template>
  <section
    ref="el"
    class="slided"
    :class="{open: isOpened}"
  >
    <slot />
  </section>
  <div
    class="backdrop slided"
    :class="{open: isOpened}"
    @click="$emit('close-request')"
  />
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

  emits: ['close-request'],
});
</script>

<style scoped>

.slided {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  display: none;
  /*transform: translateX(100%);*/
  /*transition: transform 250ms linear;*/
  /*will-change: transform;*/
}

.slided.open {
  display: block;
  /*transform: translateX(0);*/
}

section {
  z-index: 10;
  width: 300px;
  -webkit-backdrop-filter: blur(10px);
  backdrop-filter: blur(10px);
  background-color: rgba(255, 255, 255, 0.75);
  height: 100%;
  overflow-y: auto;
}

.backdrop {
  background: transparent;
  width: 100%;
  height: 100%;
}
</style>
