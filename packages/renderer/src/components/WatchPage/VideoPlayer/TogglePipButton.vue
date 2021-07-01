<template>
  <button
    :disabled="video === null || isVideoMetadataLoaded === false"
    title="Картинка-в-картинке"
    class="win-icon"
    @click="togglePictureInPicture"
  >
    {{ isPipEnabled ? '&#xE944;' : '&#xE8A7;' }}
  </button>
</template>

<script lang="ts">
import {defineComponent, ref, toRef} from 'vue';
import {useEventListener} from '@vueuse/core';
import {isMediaMetadataLoaded} from '/@/use/isMediaMetadataLoaded';


export default defineComponent({
  name: 'TogglePipButton',
  props: {
    video: {
      type: HTMLVideoElement,
      required: false,
      default: null,
    },
  },
  setup(props) {
    const video = toRef(props, 'video');
    const {isLoaded: isVideoMetadataLoaded} = isMediaMetadataLoaded(video);

    const isPipEnabled = ref(!!document.pictureInPictureElement);
    useEventListener(video, 'enterpictureinpicture', () => isPipEnabled.value = true);
    useEventListener(video, 'leavepictureinpicture', () => isPipEnabled.value = false);


    const togglePictureInPicture = () => {
      if (document.pictureInPictureElement) {
        document.exitPictureInPicture();
      } else if (video.value instanceof HTMLVideoElement && isVideoMetadataLoaded.value) {
        video.value.requestPictureInPicture();
      }
    };

    useEventListener('keydown', (event: KeyboardEvent) => {
      if (event.code === 'KeyI' && !event.shiftKey && !event.ctrlKey) {
        togglePictureInPicture();
      }
    });

    return {togglePictureInPicture, isPipEnabled, isVideoMetadataLoaded};
  },
});
</script>

<style scoped>

</style>
