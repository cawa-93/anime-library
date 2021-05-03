<template>
  <app-window-title-bar />
  <div id="main">
    <pre v-if="isDebug"><code>{{ route }}</code></pre>
    <router-view />
  </div>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import AppWindowTitleBar from '/@/components/AppWindowTitleBar/AppWindowTitleBar.vue';
import {useRoute} from 'vue-router';
import {reactivePick} from '@vueuse/core';

export default defineComponent({
  name: 'App',
  components: {AppWindowTitleBar},
  setup() {
    const isDebug = import.meta.env.MODE === 'development';
    const route = useRoute();

    return {isDebug, route: reactivePick(route, 'fullPath', 'params', 'meta', 'query', 'name', 'redirectedFrom')};
  },
});
</script>

<style>
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
  border: 1px solid #48545c;
  overflow: hidden;
  font-family: "Segoe UI", sans-serif;
}

/**/
#main {
  height: calc(100% - 32px);
  margin-top: 32px;
  overflow: auto;
}

a {
  color: inherit;
}
</style>
