<template>
  <button
    class="btn win-icon rounded-0 py-0 border-0 d-flex align-items-center justify-content-center"
    type="button"
    title="Свернуть"
    @click="minimize"
  >
    &#xE921;
  </button>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import {minimize} from '/@/utils/window-controllers';

export default defineComponent({
  name: 'MinimizeButton',

  setup() {
    return {minimize};
  },
});
</script>

<style scoped>
@import "base-titlebar-button.css";
</style>
