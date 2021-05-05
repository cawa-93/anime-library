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
@import "button.css";
</style>
