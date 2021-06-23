<template>
  <header
    id="title-bar"
    :class="{maximized: isMaximized}"
  >
    <div
      id="drag-region"
      class="d-flex"
    >
      <back-button id="back-button" />
      <home-button />
      <feedback-button />
      <window-title class="flex-fill px-3 align-self-center" />
      <options-button />
      <minimize-button class="window-control" />
      <maximize-button class="window-control" />
      <close-button class="window-control" />
    </div>
  </header>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import BackButton from './BackButton.vue';
import WindowTitle from './WindowTitle.vue';
import MinimizeButton from '/@/components/AppWindowTitleBar/MinimizeButton.vue';
import CloseButton from '/@/components/AppWindowTitleBar/CloseButton.vue';
import MaximizeButton from '/@/components/AppWindowTitleBar/MaximizeButton.vue';
import {isWindowMaximized} from '/@/use/isWindowMaximized';
import HomeButton from '/@/components/AppWindowTitleBar/HomeButton.vue';
import OptionsButton from '/@/components/AppWindowTitleBar/OptionsButton.vue';
import FeedbackButton from '/@/components/AppWindowTitleBar/FeedbackButton.vue';


export default defineComponent({
  name: 'AppTitleBar',
  components: {
    FeedbackButton,
    OptionsButton,
    HomeButton,
    MaximizeButton,
    CloseButton,
    MinimizeButton,
    WindowTitle,
    BackButton,
  },
  setup() {
    const {isMaximized} = isWindowMaximized();
    return {isMaximized};
  },
});
</script>

<style scoped>
#title-bar {
  --padding: 5px;
  padding: var(--padding);
}

#title-bar.maximized {
  --padding: 0px;
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
