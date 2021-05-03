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
import {createIpcClient} from '/@/ipc';

export default defineComponent({
  name: 'MinimizeButton',
  components: {WinIcon},

  setup() {
    const {minimize} = createIpcClient('WindowControllers');
    return {minimize};
  },
});
</script>

<style scoped>
@import "button.css";
</style>
