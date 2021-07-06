<template>
  <button
    class="btn win-icon rounded-0 py-0 border-0 d-flex align-items-center justify-content-center"
    type="button"
    :title="isMaximized ? 'Восстановить' : 'Развернуть'"
    :aria-label="isMaximized ? 'Восстановить' : 'Развернуть'"
    @click="toggleMaximizeState"
  >
    {{ isMaximized ? '&#xE923;' : '&#xE922;' }}
  </button>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import {isWindowMaximized} from '/@/use/isWindowMaximized';
import {toggle} from '/@/utils/window-controllers';

export default defineComponent({
  name: 'MaximizeButton',

  setup() {

    const {isMaximized, forceUpdate} = isWindowMaximized();

    const toggleMaximizeState = () => {
      forceUpdate();
      toggle();
    };

    return {isMaximized, toggleMaximizeState};
  },
});
</script>

<style scoped>
@import "base-titlebar-button.css";
</style>
