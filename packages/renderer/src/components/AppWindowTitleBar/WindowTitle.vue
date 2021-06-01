<template>
  <small class="d-inline-block text-truncate">{{ title }} — Anime Library v{{ appVersion }}</small>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import {useTitle} from '@vueuse/core';


export default defineComponent({
  name: 'WindowTitle',
  setup() {

    const title = useTitle(undefined, {observe: true});

    const appVersion = import.meta.env.VITE_APP_VERSION;

    return {title, appVersion};
  },
});
</script>
