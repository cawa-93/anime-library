<template>
  <router-link
    class="btn win-icon rounded-0 py-0 border-0 d-flex align-items-center justify-content-center"
    :to="{name: 'Home'}"
    title="На главную"
    aria-label="На главную"
  >
    &#xE80F;
  </router-link>
</template>

<script lang="ts">
import {defineComponent} from 'vue';

export default defineComponent({
  name: 'HomeButton',
});
</script>

<style scoped>
@import "base-titlebar-button.css";
</style>
