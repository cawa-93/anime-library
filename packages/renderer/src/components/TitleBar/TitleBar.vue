<script lang="ts" setup>
import BackButton from '/@/components/TitleBar/TitleBarGoBackButton.vue';
import WindowTitle from '/@/components/TitleBar/TitleBarTitle.vue';
import MinimizeButton from '/@/components/TitleBar/TitleBarMinimizeWindowButton.vue';
import CloseButton from '/@/components/TitleBar/TitleBarCloseWindowButton.vue';
import MaximizeButton from '/@/components/TitleBar/TitleBarMaximizeWindowButton.vue';
import HomeButton from '/@/components/TitleBar/TitleBarGoHomeButton.vue';
import OptionsButton from '/@/components/TitleBar/TitleBarOptionsButton.vue';
import FeedbackButton from '/@/components/TitleBar/TitleBarFeedbackButton.vue';
import OpenShikimori from '/@/components/TitleBar/TitleBarGoToShikimori.vue';
</script>


<template>
  <header>
    <div
      id="drag-region"
      class="d-flex"
    >
      <back-button id="back-button" />
      <home-button />
      <feedback-button />
      <open-shikimori />
      <window-title class="flex-fill px-3 align-self-center" />
      <options-button />
      <minimize-button class="window-control" />
      <maximize-button class="window-control" />
      <close-button class="window-control" />
    </div>
  </header>
</template>

<style scoped>
header {
  --padding: 5px;
  padding: var(--padding);
}

#back-button {
  font-size: 12px;
}

.window-control {
  width: 45px;
  font-size: 10px;
}

#drag-region {
  height: calc(24px + var(--padding) * 2);
  -webkit-app-region: drag;
  margin: calc(-1 * var(--padding));
}

</style>
