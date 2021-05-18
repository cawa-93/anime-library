<template>
  <span>{{ title }} v{{ appVersion }}-alpha</span>
</template>

<script lang="ts">
import {defineComponent, ref} from 'vue';
import {useMutationObserver} from '@vueuse/core';
import {useAppVersion} from '/@/use/useAppVersion';

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

    const appVersion = useAppVersion();

    return {title, appVersion};
  },
});
</script>

<style scoped>
span {
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow-x: hidden;
}
</style>
