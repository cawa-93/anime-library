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
      <a
        class="btn rounded-0 py-0 border-0 text-primary title-bar-github-link text-truncate d-sm-inline-flex d-none align-items-center justify-content-center "
        href="#"
        @click.prevent="onClick"
      >
        <small>
          {{ selectedVariant }}
        </small>
      </a>
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
import {useElectron} from '/@/use/electron';
import {trackEvent} from '/@/utils/telemetry';


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
    const textVariants = [
      '🐞 Сообщить об ошибке',
      '💡 Предложить идею',
      '❓ Задать вопрос',
    ];

    const selectedVariant = textVariants[Math.floor(Math.random() * textVariants.length)];

    const {openURL} = useElectron();
    const onClick = () => {
      openURL('https://github.com/cawa-93/anime-library/issues/new/choose');
      trackEvent({
        ec: 'New Issue',
        ea: 'Click Title bar link',
        el: selectedVariant,
      });
    };

    const {isMaximized} = isWindowMaximized();
    return {isMaximized, onClick, selectedVariant};
  },
});
</script>

<style scoped>
@import "base-titlebar-button.css";

#title-bar {
  --padding: 5px;
  padding: var(--padding);
}

#title-bar.maximized {
  --padding: 0px;
}

.title-bar-github-link {
  flex-shrink: 0.15;
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
