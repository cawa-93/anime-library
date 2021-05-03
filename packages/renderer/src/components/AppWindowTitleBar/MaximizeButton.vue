<template>
  <button
    class="button"
    type="button"
    @click="toggleMaximizeState"
  >
    <win-icon>
      {{ isMaximized ? '&#xE923;' : '&#xE922;' }}
    </win-icon>
  </button>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import WinIcon from '/@/components/WinIcon.vue';
import type {ipcClient} from '/@/ipc';
import {createIpcClient} from '/@/ipc';
import type {WindowControllers} from '/@shared/types/ipc/WindowControllers';
import {isWindowMaximized} from '/@/use/isWindowMaximized';

export default defineComponent({
  name: 'MaximizeButton',
  components: {WinIcon},

  setup() {
    const {maximize, unmaximize} = createIpcClient('WindowController') as ipcClient<WindowControllers>;

    const {isMaximized} = isWindowMaximized();

    const toggleMaximizeState = () => {
      isMaximized.value ? unmaximize() : maximize();
    };

    return {isMaximized, toggleMaximizeState};
  },
});
</script>

<style scoped>
@import "button.css";
</style>
