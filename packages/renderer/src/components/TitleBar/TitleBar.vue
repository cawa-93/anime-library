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
  <header class="flex region-drag bg-[#f2f2f2] dark:(bg-[#2b2b2b] text-white)">
    <back-button />
    <home-button />
    <help-button />
    <open-shikimori />
    <window-title class="flex-fill px-3 align-self-center" />
    <options-button />
    <minimize-button class="window-control" />
    <maximize-button class="window-control" />
    <close-button class="window-control" />
  </header>
</template>

<style scoped>
/*@import "btn-titlebar.css";*/

header {
  --title-bar-height: 34px;
  height: var(--title-bar-height);
}

/*header {*/
/*  --padding: 5px;*/
/*  padding: var(--padding);*/
/*}*/

/*#back-button {*/
/*  font-size: 12px;*/
/*}*/

/*.window-control {*/
/*  width: 45px;*/
/*  font-size: 10px;*/
/*}*/

/*#drag-region {*/
/*  height: calc(24px + var(--padding) * 2);*/
/*  -webkit-app-region: drag;*/
/*  margin: calc(-1 * var(--padding));*/
/*}*/

</style>
