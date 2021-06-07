<template>
  <router-link
    class="win-icon btn rounded-0 py-0 border-0 d-flex align-items-center justify-content-center"
    :to="{name: 'Options'}"
    title="Параметры"
  >
    &#xE713;
  </router-link>
</template>

<script lang="ts">
import {defineComponent} from 'vue';

export default defineComponent({
  name: 'OptionsButton',
});
</script>

<style scoped>
@import "base-titlebar-button.css";
</style>
