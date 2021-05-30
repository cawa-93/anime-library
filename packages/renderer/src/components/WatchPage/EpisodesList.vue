<template>
  <play-list
    class="my-3"
    :items="playListItems"
    :selected-item-id="selectedEpisode?.id"
    @item-click="track"
  />
</template>

<script lang="ts">
import type {DeepReadonly, PropType} from 'vue';
import {computed, defineComponent} from 'vue';
import {useRoute} from 'vue-router';
import type {Episode} from '/@/utils/videoProvider';
import type {PlayListItem} from '/@/components/WatchPage/PlayList.vue';
import PlayList from '/@/components/WatchPage/PlayList.vue';
import {trackEvent} from '/@/utils/telemetry';


export default defineComponent({
  name: 'EpisodesList',
  components: {PlayList},
  props: {
    episodes: {
      type: Array as PropType<DeepReadonly<Episode[]>>,
      required: true,
    },
  },
  setup(props) {
    const route = useRoute();
    const selectedEpisode = computed(() => props.episodes.find(e => String(e.number) === route.params.episodeNum) || null);

    const playListItems = computed<PlayListItem[]>(
      () => props.episodes.map(e => ({
        id: e.id,
        label: e.title,
        url: {params: {episodeNum: e.number, translationId: ''}, hash: ''},
      })),
    );

    const track = () => trackEvent({ec: 'PlayList Manual Select', ea: 'Episode Select'});

    return {selectedEpisode, playListItems, track};
  },
});
</script>
