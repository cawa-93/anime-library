<script lang="ts" setup>
import {isWindowMaximized} from '/@/use/isWindowMaximized';
import {toggle} from '/@/utils/window-controllers';


const {isMaximized, forceUpdate} = isWindowMaximized();

const toggleMaximizeState = () => {
  forceUpdate();
  toggle();
};
</script>

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

<style scoped>
@import "base-titlebar-button.css";
</style>
