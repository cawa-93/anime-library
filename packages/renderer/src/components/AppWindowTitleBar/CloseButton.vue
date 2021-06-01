<template>
  <button
    class="btn rounded-0 py-0 border-0 d-flex align-items-center justify-content-center"
    type="button"
    @click="close"
  >
    <win-icon>&#xE8BB;</win-icon>
  </button>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import WinIcon from '/@/components/WinIcon.vue';
import {close} from '/@/utils/window-controllers';

export default defineComponent({
  name: 'CloseButton',
  components: {WinIcon},

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
