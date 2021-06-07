<template>
  <div
    id="app"
    :style="`--window-border-width: ${borderWidth}`"
  >
    <app-window-title-bar />
    <main>
      <router-view />
    </main>
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

<style>
@import "animations.css";
@import "../../../node_modules/bootstrap/dist/css/bootstrap.min.css";
html {
  box-sizing: border-box;
}

*, *:before, *:after {
  box-sizing: inherit;
}

/*noinspection CssUnusedSymbol*/
html, body, #app {
  height: 100%;
  margin: 0;
}

/**/
body {
  overflow: hidden;
  font-family: "Segoe UI", sans-serif;
}

#app {
  /*noinspection CssUnresolvedCustomProperty*/
  border: var(--window-border-width) solid #48545c;
  display: flex;
  flex-direction: column;
}

/**/
main {
  flex-grow: 1;
  overflow: auto;
}

main * {
  -webkit-app-region: no-drag !important;
}

.win-icon {
  font-family: "Segoe MDL2 Assets", sans-serif;
}
</style>
