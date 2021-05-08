<template>
  <div id="app">
    <app-window-title-bar />
    <div id="main">
      <router-view />
    </div>
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
  /*noinspection CssInvalidFunction*/
  --window-border-width: v-bind(borderWidth);
  border: var(--window-border-width) solid #48545c;
  display: flex;
  flex-direction: column;
}

/**/
#main {
  flex-grow: 1;
  overflow: auto;
}

a {
  color: inherit;
}
</style>
