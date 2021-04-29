<template>
  <header id="titlebar">
    <div id="drag-region">
      <back-button />
      <window-title />
      <windows-window-controls />
    </div>
  </header>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import BackButton from './BackButton.vue';
import WindowsWindowControls from '/@/components/title-bar/WindowsWindowControls.vue';
import WindowTitle from '/@/components/title-bar/WindowTitle.vue';

export default defineComponent({
  name: 'AppTitleBar',
  components: {WindowTitle, WindowsWindowControls, BackButton},
});
</script>

<style scoped>
#titlebar {
  top: 0;
  display: block;
  position: fixed;
  height: 32px;
  width: calc(100% - 2px); /*Compensate for body 1px border*/
  /*-webkit-backdrop-filter: blur(10px);*/
  /*backdrop-filter: blur(10px);*/
  /*background-color: rgba(255, 255, 255, 0.5);*/
}

#titlebar {
  padding: 4px;
}

#titlebar #drag-region {
  width: 100%;
  height: 100%;
  -webkit-app-region: drag;
  display: flex;
  align-items: center;
}

</style>
