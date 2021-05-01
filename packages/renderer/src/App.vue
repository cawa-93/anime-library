<template>
  <app-title-bar />
  <div id="main">
    <!--    <pre><code>{{ route }}</code></pre>-->
    <router-view />
  </div>
</template>

<script lang="ts">
import {defineComponent, reactive} from 'vue';
import AppTitleBar from '/@/components/title-bar/AppTitleBar.vue';
import {useRoute} from 'vue-router';
import {reactivePick} from '@vueuse/core';
export default defineComponent({
  name: 'App',
  components: {AppTitleBar},
  setup() {
    const r = reactive(useRoute());
    return {route: reactivePick(r, 'fullPath', 'params')};
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
