<script lang="ts" setup>


import {useElectron} from '/@/use/electron';

const props = defineProps({
  id: {
    type: [String, Number],
    required: true,
  },

  title: {
    type: String,
    required: false,
    default: 'Удерживайте Ctrl, чтобы открыть Шикимори',
  },
});

const {openURL} = useElectron();
const openAnime = (event: MouseEvent) => {
  if (event.ctrlKey || event.button === 1) {
    event.preventDefault();
    return openURL('https://shikimori.one/animes/' + props.id);
  }
};
</script>

<template>
  <router-link
    :title="title"
    :to="{name: 'Watch', params: {seriesId: id}}"
    @click="openAnime"
    @auxclick="openAnime"
  >
    <slot />
  </router-link>
</template>
