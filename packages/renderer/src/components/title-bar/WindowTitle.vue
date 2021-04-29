<template>
  <span>{{ title }}</span>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import {useTitle} from '@vueuse/core';

export default defineComponent({
  name: 'WindowTitle',
  setup() {
    const title = useTitle();

    return {title};
  },
});
</script>

<style scoped>

</style>
