<script lang="ts" setup>
import {isWindowMaximized} from '/@/use/isWindowMaximized';

const {isMaximized} = isWindowMaximized();

const toggleMaximizeState = () => {
  isMaximized.value ? window.unmaximize() : window.maximize();
};
</script>

<template>
  <button
    class="btn-title-bar win-icon win-icon-xs w-[45px]"
    type="button"
    :title="isMaximized ? 'Восстановить' : 'Развернуть'"
    :aria-label="isMaximized ? 'Восстановить' : 'Развернуть'"
    @click="toggleMaximizeState"
  >
    {{ isMaximized ? '&#xE923;' : '&#xE922;' }}
  </button>
</template>

<style scoped>
@import "./btn-titlebar.css";
</style>
