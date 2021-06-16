<template>
  <slot
    name="activator"
    :open="() => opened = true"
    :close="() => opened = false"
    :toggle="() => opened = !opened"
  />
  <section
    v-if="opened"
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

  setup() {
    const el = ref();
    const opened = ref(false);
    onClickOutside(el, () => opened.value = false);
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
