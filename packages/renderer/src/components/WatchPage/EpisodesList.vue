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
import {trackEvent} from '/@/utils/telemetry';


interface EpisodePlayListItem extends PlayListItem {
  episode: Episode
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
  },
  emits: ['update:currentEpisode'],
  setup(props, {emit}) {

    const playListItems = computed<EpisodePlayListItem[]>(
      () => props.episodes.map(e => {
        const badges: EpisodePlayListItem['badges'] = [];

        if (e.recap) {
          badges.push({
            text: 'recap',
            style: 'info',
          });
        }

        if (e.filler) {
          badges.push({
            text: 'filler',
            style: 'danger',
          });
        }

        return ({
          id: e.id,
          label: e.title,
          episode: e,
          badges,
        });
      }),
    );

    const onManualSelect = (item: EpisodePlayListItem) => {
      emit('update:currentEpisode', item.episode);

      trackEvent({ec: 'PlayList Manual Select', ea: 'Episode Select'});
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
