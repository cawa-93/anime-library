<template>
  <button
    class="btn win-icon rounded-0 py-0 border-0 d-flex align-items-center justify-content-center"
    type="button"
    title="Свернуть"
    aria-label="Свернуть"
    @click="minimize"
  >
    &#xE921;
  </button>
</template>

<script lang="ts" setup>
import {minimize} from '/@/utils/window-controllers';
</script>

<style scoped>
@import "base-titlebar-button.css";
</style>
