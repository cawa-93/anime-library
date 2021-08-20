<template>
  <play-list
    class="my-3 episode-list"
    :items="playListItems"
    :selected-item-id="currentEpisode.id"
    @item-click="onManualSelect"
  />
</template>

<script lang="ts">
import type {PropType} from 'vue';
import {computed, defineComponent} from 'vue';
import type {Episode} from '/@/utils/videoProvider';
import type {PlayListItem} from '/@/components/WatchPage/PlayList.vue';
import PlayList from '/@/components/WatchPage/PlayList.vue';
import {getEpisodeMeta} from '/@/utils/videoProvider';
import {asyncComputed} from '@vueuse/core';


interface EpisodePlayListItem extends PlayListItem {
  episode: Episode;
}


export default defineComponent({
  name: 'EpisodesList',
  components: {PlayList},
  props: {
    episodes: {
      type: Array as PropType<Episode[]>,
      required: true,
    },
    currentEpisode: {
      type: Object as PropType<Episode>,
      required: false,
      default: () => ({}),
    },
    seriesId: {
      type: Number,
      required: false,
      default: undefined,
    },
  },
  emits: ['update:currentEpisode'],
  setup(props, {emit}) {

    const allEpisodesMeta = asyncComputed<Map<number, { title: string, filler: boolean, recap: boolean }> | undefined>(() => {
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
              }, new Map<number, { title: string, filler: boolean, recap: boolean }>());
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
            text: 'recap',
            style: 'info',
          });
        }

        if (meta?.filler) {
          badges.push({
            text: 'filler',
            style: 'danger',
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
      emit('update:currentEpisode', item.episode);
    };

    return {playListItems, onManualSelect};
  },
});
</script>

<style scoped>
.episode-list {
  max-width: 500px;
}
</style>
