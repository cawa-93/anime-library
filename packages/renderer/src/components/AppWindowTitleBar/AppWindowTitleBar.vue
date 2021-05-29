<template>
  <header
    id="title-bar"
    :class="{maximized: isMaximized}"
  >
    <div id="drag-region">
      <back-button id="back-button" />
      <home-button />
      <a
        class="button text-danger"
        href="https://github.com/cawa-93/anime-library/issues/new/choose"
        @click.prevent="openURL($event.target.href)"
      >🐞 Обратная связь</a>
      <window-title id="window-title" />
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
import {useElectron} from '/@/use/electron';


export default defineComponent({
  name: 'AppTitleBar',
  components: {
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
    const {openURL} = useElectron();
    return {isMaximized, openURL};
  },
});
</script>

<style scoped>
@import "button.css";
#title-bar {
  --padding: 5px;
  padding: var(--padding);
}

#title-bar.maximized {
  --padding: 0px;
}

#window-title {
  flex: 1;
  margin-left: 1rem;
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
  display: flex;
  align-items: center;
  -webkit-app-region: drag;
  margin: calc(-1 * var(--padding));
}

</style>
