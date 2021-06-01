<template>
  <router-link
    class="btn rounded-0 py-0 border-0 d-flex align-items-center justify-content-center"
    :to="{name: 'Home'}"
    title="На главную"
  >
    <win-icon>
      &#xE80F;
    </win-icon>
  </router-link>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import WinIcon from '/@/components/WinIcon.vue';

export default defineComponent({
  name: 'HomeButton',
  components: {WinIcon},
});
</script>

<style scoped>
@import "base-titlebar-button.css";
</style>
