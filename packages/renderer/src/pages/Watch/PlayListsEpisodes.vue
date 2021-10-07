<script lang="ts" setup>
import type {PropType} from 'vue';
import {computed} from 'vue';
import type {Episode} from '/@/utils/videoProvider';
import type {PlayListItem} from '/@/pages/Watch/PlayListsBaseList.vue';
import PlayListsBaseList from '/@/pages/Watch/PlayListsBaseList.vue';
import {getEpisodeMeta} from '/@/utils/videoProvider';
import {asyncComputed} from '@vueuse/core';


interface EpisodePlayListItem extends PlayListItem {
  episode: Episode;
}


const props = defineProps({
  episodes: {
    type: Array as PropType<Episode[]>,
    required: true,
  },
  selectedEpisode: {
    type: Object as PropType<Episode>,
    required: false,
    default: () => ({}),
  },
  seriesId: {
    type: Number,
    required: false,
    default: undefined,
  },
});

const emit = defineEmits({
  'update:selectedEpisode': (episode) => !!episode,
});



const allEpisodesMeta = asyncComputed<Map<number, { title?: string, filler: boolean, recap: boolean }> | undefined>(
  () => {
    const seriesId = props.seriesId;
    return seriesId && props.episodes.length
      ? Promise.allSettled(props.episodes.map(e => getEpisodeMeta(seriesId, e.number)))
        .then(settled => {
          return settled.reduce((accum, result) => {
            if (result.status === 'rejected' || result.value === undefined) {
              return accum;
            }

            accum.set(result.value.episode_id, result.value);

            return accum;
          }, new Map<number, { title?: string, filler: boolean, recap: boolean }>());
        })
      : undefined;
  },
  undefined,
);

const playListItems = computed<EpisodePlayListItem[]>(
  () => props.episodes.map(episode => {
    const badges: EpisodePlayListItem['badges'] = [];

    const meta = allEpisodesMeta.value?.get(episode.number);

    const label = meta?.title ? `${episode.number}. ${meta?.title}` : episode.title;


    if (meta?.recap) {
      badges.push({
        text: 'Рекап',
        class: 'bg-blue-500 dark:bg-blue-600',
      });
    }

    if (meta?.filler) {
      badges.push({
        text: 'Филлер',
        class: 'bg-red-500 dark:bg-red-600',
      });
    }

    return {
      id: episode.id,
      label,
      episode,
      badges,
    };
  }),
);

const onManualSelect = (item: EpisodePlayListItem) => {
  emit('update:selectedEpisode', item.episode);
};
</script>

<template>
  <play-lists-base-list
    class="my-3 max-w-[500px]"
    :items="playListItems"
    :selected-item-id="selectedEpisode.id"
    @item-click="onManualSelect"
  />
</template>
