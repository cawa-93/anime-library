<template>
  <pre><code>{{ location }}</code></pre>
</template>

<script>
import {useBrowserLocation} from '@vueuse/core';
import {defineComponent} from 'vue';

export default defineComponent({
  name: 'AppLocation',
  setup() {
    const location = useBrowserLocation();
    return {location};
  },
});
</script>

<style scoped>

</style>
