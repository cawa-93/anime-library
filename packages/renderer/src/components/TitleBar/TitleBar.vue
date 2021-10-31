<script lang="ts" setup>
import BackButton from '/@/components/TitleBar/TitleBarGoBackButton.vue';
import WindowTitle from '/@/components/TitleBar/TitleBarTitle.vue';
import MinimizeButton from '/@/components/TitleBar/TitleBarMinimizeWindowButton.vue';
import CloseButton from '/@/components/TitleBar/TitleBarCloseWindowButton.vue';
import MaximizeButton from '/@/components/TitleBar/TitleBarMaximizeWindowButton.vue';
import HomeButton from '/@/components/TitleBar/TitleBarGoHomeButton.vue';
import OptionsButton from '/@/components/TitleBar/TitleBarOptionsButton.vue';
import OpenShikimori from '/@/components/TitleBar/TitleBarGoToShikimori.vue';
</script>


<template>
  <header class="flex region-drag max-w-screen h-8">
    <back-button />
    <home-button />
    <open-shikimori />
    <window-title class="px-3 align-self-center" />
    <options-button />
    <minimize-button />
    <maximize-button />
    <close-button />
  </header>
</template>
