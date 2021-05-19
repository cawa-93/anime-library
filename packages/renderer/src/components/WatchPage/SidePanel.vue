<template>
  <section
    ref="el"
    class="slided"
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
    isOpened: {
      type: Boolean,
      required: false,
      default: false,
    },
  },

  emits: ['update:isOpened'],

  setup(_, {emit}) {
    const el = ref();

    onClickOutside(el, () => emit('update:isOpened', false));

    return {el};
  },
});
</script>

<style scoped>

.slided {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  /*display: none;*/
  /*transform: translateX(100%);*/
  /*transition: transform 250ms linear;*/
  /*will-change: transform;*/
}

/*.slided.open {*/
/*  display: block;*/
/*transform: translateX(0);*/
/*}*/

section {
  z-index: 10;
  width: 300px;
  -webkit-backdrop-filter: blur(10px);
  backdrop-filter: blur(10px);
  background-color: rgba(255, 255, 255, 0.75);
  height: 100%;
  overflow-y: auto;
}
</style>
