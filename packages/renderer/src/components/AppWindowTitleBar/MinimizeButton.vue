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
import {useElectron} from '/@/use/electron';

export default defineComponent({
  name: 'MinimizeButton',
  components: {WinIcon},

  setup() {
    const {minimize} = useElectron();
    return {minimize};
  },
});
</script>

<style scoped>
@import "button.css";
</style>
