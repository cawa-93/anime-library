<script lang="ts" setup>
const minimize = window.minimize;
</script>

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

<style scoped>
@import "./btn-titlebar.css";
</style>
