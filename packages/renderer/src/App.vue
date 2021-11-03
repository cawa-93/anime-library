<script lang="ts" setup>
import {isWindowMaximized} from '/@/use/isWindowMaximized';
import TitleBar from '/@/components/TitleBar/TitleBar.vue';
import {watchEffect} from 'vue';
import {useInFocus} from '/@/use/useInFocus';


const {isMaximized} = isWindowMaximized();
const {inFocus} = useInFocus();
watchEffect(() => {
  document.body.style.border = `${isMaximized.value ? 0 : 1}px solid ${inFocus.value ? 'black' : 'rgba(0,0,0,0.5)'}`;
});
</script>

<template>
  <title-bar />
  <router-view />
</template>
