<template>
  <button
    class="button"
    type="button"
    @click="minimize"
  >
    <win-icon>&#xE921;</win-icon>
  </button>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import WinIcon from '/@/components/WinIcon.vue';
import type {ipcClient} from '/@/ipc';
import {createIpcClient} from '/@/ipc';
import type {WindowControllers} from '/@shared/types/ipc/WindowControllers';

export default defineComponent({
  name: 'MinimizeButton',
  components: {WinIcon},

  setup() {
    const {minimize} = createIpcClient('WindowController') as ipcClient<WindowControllers>;
    return {minimize};
  },
});
</script>

<style scoped>
@import "button.css";
</style>
