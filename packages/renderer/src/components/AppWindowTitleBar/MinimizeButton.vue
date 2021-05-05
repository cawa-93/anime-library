<template>
  <button
    class="button"
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
@import "button.css";
</style>
