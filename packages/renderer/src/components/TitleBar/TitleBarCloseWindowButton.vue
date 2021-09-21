<script lang="ts" setup>
import {close} from '/@/utils/window-controllers';
</script>

<template>
  <button
    class="btn-title-bar win-icon win-icon-xs w-[45px] !hover:(bg-[#E81123] text-white)"
    title="Закрыть"
    aria-label="Закрыть"
    type="button"
    @click="close"
  >
    &#xE8BB;
  </button>
</template>


<style scoped>
@import "./btn-titlebar.css";
</style>
