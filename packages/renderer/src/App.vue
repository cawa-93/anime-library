<script lang="ts" setup>
import {isWindowMaximized} from '/@/use/isWindowMaximized';
import TitleBar from '/@/components/TitleBar/TitleBar.vue';
import {watch} from 'vue';


const {isMaximized} = isWindowMaximized();
watch(isMaximized, (isMaximized) => {
  document.body.style.border = `${isMaximized ? 0 : 1}px solid black`;
}, {immediate: true});
</script>

<template>
  <title-bar />
  <router-view />
</template>
