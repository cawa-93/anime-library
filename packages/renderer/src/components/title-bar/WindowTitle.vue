<template>
  <span>{{ title }}</span>
</template>

<script lang="ts">
import {defineComponent, ref} from 'vue';
import {useMutationObserver} from '@vueuse/core';

export default defineComponent({
  name: 'WindowTitle',
  setup() {

    const title = ref(document.title);

    useMutationObserver(
      document.head.querySelector('title'),
      () => {
        if (document.title !== title.value)
          title.value = document.title;
      },
      {childList: true},
    );

    return {title};
  },
});
</script>

<style scoped>

</style>
