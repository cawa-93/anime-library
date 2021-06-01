<template>
  <button
    class="btn rounded-0 py-0 border-0 d-flex align-items-center justify-content-center"
    type="button"
    @click="minimize"
  >
    <win-icon>&#xE921;</win-icon>
  </button>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import WinIcon from '/@/components/WinIcon.vue';
import {minimize} from '/@/utils/window-controllers';

export default defineComponent({
  name: 'MinimizeButton',
  components: {WinIcon},

  setup() {
    return {minimize};
  },
});
</script>

<style scoped>
@import "base-titlebar-button.css";
</style>
