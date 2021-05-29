<template>
  <router-link
    class="button"
    :to="{name: 'Options'}"
    title="Параметры"
  >
    <win-icon>
      &#xE713;
    </win-icon>
  </router-link>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import WinIcon from '/@/components/WinIcon.vue';

export default defineComponent({
  name: 'OptionsButton',
  components: {WinIcon},
});
</script>

<style scoped>
@import "button.css";
</style>
