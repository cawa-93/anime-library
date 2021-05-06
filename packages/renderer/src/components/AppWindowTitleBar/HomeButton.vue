<template>
  <router-link
    class="button"
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
@import "button.css";

.button {
  cursor: default;
}
</style>
