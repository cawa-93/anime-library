<template>
  <button
    class="btn-title-bar win-icon win-icon-xs w-[45px]"
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
@import "./btn-titlebar.css";
</style>
