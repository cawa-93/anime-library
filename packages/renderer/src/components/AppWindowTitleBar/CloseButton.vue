<template>
  <button
    class="button"
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
@import "button.css";

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
