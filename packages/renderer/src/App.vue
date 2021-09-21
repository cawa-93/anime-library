<script lang="ts" setup>
import {isWindowMaximized} from '/@/use/isWindowMaximized';
import {computed} from 'vue';
import TitleBar from '/@/components/TitleBar/TitleBar.vue';


const {isMaximized} = isWindowMaximized();
const borderWidth = computed(() => isMaximized.value ? '0px' : '1px');
</script>

<template>
  <div
    id="app"
    :style="`--window-border-width: ${borderWidth}`"
    class=""
  >
    <title-bar />
    <router-view />
  </div>
</template>
