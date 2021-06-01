<template>
  <button
    class="btn rounded-0 py-0 border-0 d-flex align-items-center justify-content-center"
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
import {isWindowMaximized} from '/@/use/isWindowMaximized';
import {maximize, unmaximize} from '/@/utils/window-controllers';

export default defineComponent({
  name: 'MaximizeButton',
  components: {WinIcon},

  setup() {

    const {isMaximized} = isWindowMaximized();

    const toggleMaximizeState = () => {
      isMaximized.value ? unmaximize() : maximize();
    };

    return {isMaximized, toggleMaximizeState};
  },
});
</script>

<style scoped>
@import "base-titlebar-button.css";
</style>
