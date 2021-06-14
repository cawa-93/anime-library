<template>
  <div
    id="app"
    :style="`--window-border-width: ${borderWidth}`"
  >
    <app-window-title-bar />
    <router-view />
  </div>
</template>

<script lang="ts">
import {computed, defineComponent} from 'vue';
import AppWindowTitleBar from '/@/components/AppWindowTitleBar/AppWindowTitleBar.vue';
import {useRoute} from 'vue-router';
import {reactivePick} from '@vueuse/core';
import {isWindowMaximized} from '/@/use/isWindowMaximized';


export default defineComponent({
  name: 'App',
  components: {AppWindowTitleBar},
  setup() {
    const isDebug = import.meta.env.MODE === 'development';
    const route = useRoute();

    const {isMaximized} = isWindowMaximized();
    const borderWidth = computed(() => isMaximized.value ? '0px' : '1px');

    return {
      isDebug,
      route: reactivePick(route, 'fullPath', 'params', 'meta', 'query', 'name', 'redirectedFrom'),
      borderWidth,
    };
  },
});
</script>
