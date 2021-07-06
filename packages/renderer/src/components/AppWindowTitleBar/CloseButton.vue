<template>
  <button
    class="btn win-icon rounded-0 py-0 border-0 d-flex align-items-center justify-content-center"
    title="Закрыть"
    aria-label="Закрыть"
    type="button"
    @click="close"
  >
    &#xE8BB;
  </button>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import {close} from '/@/utils/window-controllers';

export default defineComponent({
  name: 'CloseButton',
  setup() {
    return {close};
  },
});
</script>

<style scoped>
@import "base-titlebar-button.css";
button:hover {
  background: #E81123 !important;
}

button:active {
  background: #F1707A !important;
}

button:active, button:hover {
  color: white;
}
</style>
