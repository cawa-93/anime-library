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
import {createIpcClient} from '/@/ipc';
import {isWindowMaximized} from '/@/use/isWindowMaximized';

export default defineComponent({
  name: 'MaximizeButton',
  components: {WinIcon},

  setup() {
    const {maximize, unmaximize} = createIpcClient('WindowControllers');

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
