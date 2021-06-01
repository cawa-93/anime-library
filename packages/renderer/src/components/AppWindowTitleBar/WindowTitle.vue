<template>
  <small class="d-inline-block text-truncate">{{ title }}</small>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import {useTitle} from '@vueuse/core';


export default defineComponent({
  name: 'WindowTitle',
  setup() {
    const title = useTitle(undefined, {observe: true});
    return {title};
  },
});
</script>
