<template>
  <section
    ref="el"
  >
    <slot />
  </section>
</template>

<script lang="ts">
import {defineComponent, ref} from 'vue';
import {onClickOutside} from '@vueuse/core';


export default defineComponent({
  name: 'SidePanel',
  props: {
    defaultState: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  emits: {
    close: null,
  },

  setup(props, {emit}) {
    const el = ref();
    const opened = ref(props.defaultState);
    onClickOutside(el, () => emit('close'));
    return {el, opened};
  },
});
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
  background-color: rgba(255, 255, 255, 0.75);
  height: 100%;
  overflow-y: auto;
}
</style>
