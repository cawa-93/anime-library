<template>
  <span aria-hidden="true"><slot /></span>
</template>

<script lang="ts">
import {defineComponent} from 'vue';

export default defineComponent({
  name: 'WinIcon',
});
</script>

<style scoped>
  span {
    font-family: "Segoe MDL2 Assets";
  }
</style>
