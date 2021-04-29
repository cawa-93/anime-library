<template>
  <app-title-bar />
  <div id="main">
    <router-view />
  </div>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import AppTitleBar from '/@/components/title-bar/AppTitleBar.vue';

export default defineComponent({
  name: 'App',
  components: {AppTitleBar},
});
</script>

<style>
html {box-sizing: border-box;}
*, *:before, *:after {box-sizing: inherit;}
html, body, #app {height: 100%; margin: 0;}
/**/
body {
  border: 1px solid #48545c;
  overflow: hidden;
  font-family: "Segoe UI",sans-serif;
}
/**/
#main {
  height: calc(100% - 32px);
  margin-top: 32px;
  padding: 20px;
  overflow: auto;
}
</style>
