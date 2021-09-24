<script lang="ts" setup>
import BackButton from '/@/components/TitleBar/TitleBarGoBackButton.vue';
import WindowTitle from '/@/components/TitleBar/TitleBarTitle.vue';
import MinimizeButton from '/@/components/TitleBar/TitleBarMinimizeWindowButton.vue';
import CloseButton from '/@/components/TitleBar/TitleBarCloseWindowButton.vue';
import MaximizeButton from '/@/components/TitleBar/TitleBarMaximizeWindowButton.vue';
import HomeButton from '/@/components/TitleBar/TitleBarGoHomeButton.vue';
import OptionsButton from '/@/components/TitleBar/TitleBarOptionsButton.vue';
import HelpButton from '/@/components/TitleBar/TitleBarHelpButton.vue';
import OpenShikimori from '/@/components/TitleBar/TitleBarGoToShikimori.vue';
</script>


<template>
  <header class="flex region-drag">
    <back-button />
    <home-button />
    <help-button />
    <open-shikimori />
    <window-title class="px-3 align-self-center" />
    <options-button />
    <minimize-button />
    <maximize-button />
    <close-button />
  </header>
</template>

<style scoped>
header {
  --title-bar-height: 34px;
  height: var(--title-bar-height);
}
</style>
