<template>
  <watch-page
    v-if="normalizedSeriesId && normalizedEpisodeNum && normalizedTranslationId"
    :series-id="normalizedSeriesId"
    :episode-num="normalizedEpisodeNum"
    :translation-id="normalizedTranslationId"
  />
  <div
    v-else
    class="preloader"
  >
    <loading-spinner />
  </div>
</template>

<script lang="ts">
import type {PropType} from 'vue';
import {computed, defineComponent, watchEffect} from 'vue';
import WatchPage from '/@/components/WatchPage/WatchPage.vue';
import type {Translation} from '/@/utils/videoProvider';
import {getEpisodes, getTranslations} from '/@/utils/videoProvider';
import {getViewHistoryItem} from '/@/utils/history-views';
import {useRouter} from 'vue-router';
import {getPreferredTranslationFromList} from '/@/utils/translationRecomendations';
import LoadingSpinner from '/@/components/WatchPage/VideoPlayer/LoadingSpinner.vue';


export default defineComponent({
  name: 'WatchPageWrapper',
  components: {LoadingSpinner, WatchPage},
  props: {
    seriesId: {
      type: String as PropType<NumberLike>,
      required: true,
    },
    episodeNum: {
      type: String,
      required: false,
      default: '',
    },
    translationId: {
      type: String,
      required: false,
      default: '',
    },
  },
  setup(props) {

    const normalizedSeriesId = computed(() => {
      const num = Number.parseInt(props.seriesId as string, 10);
      return Number.isNaN(num) ? null : num;
    });

    const normalizedEpisodeNum = computed(() => {
      const num = Number.parseInt(props.episodeNum as string, 10);
      return Number.isNaN(num) ? null : num;
    });


    const normalizedTranslationId = computed(() => {
      const num = Number.parseInt(props.translationId as string, 10);
      return Number.isNaN(num) ? null : num;
    });


    const router = useRouter();


    watchEffect(async () => {
      if (props.episodeNum) {
        return;
      }

      if (!normalizedSeriesId.value) {
        return;
      }

      const [episodes, historyItem] = await Promise.all([
        getEpisodes(normalizedSeriesId.value),
        getViewHistoryItem(normalizedSeriesId.value),
      ]);

      if (!historyItem) {
        console.log('[REDIRECT]: EPISODE (default): ' + episodes[0].number);
        return router.replace({params: {episodeNum: episodes[0].number}});
      }


      // TODO: Проверять что последняя сохранённая серия была досмотрена и открывать следующую
      // const targetEpisodeNum = ...

      console.log('[REDIRECT]: EPISODE (history): ' + historyItem.episode.number + ', HASH: ' + `#t=${historyItem.episode.time}`);
      return router.replace({
        params: {episodeNum: historyItem.episode.number},
        hash: `#t=${historyItem.episode.time}`,
      });
    });


    watchEffect(async () => {
      if (props.translationId || !normalizedEpisodeNum.value || !normalizedSeriesId.value) {
        return;
      }

      console.log('[REDIRECT] translationId');
      const episodes = await getEpisodes(normalizedSeriesId.value);
      const selectedEpisode = episodes.find(e => e.number === normalizedEpisodeNum.value);

      if (!selectedEpisode) {
        return;
      }

      const translations = await getTranslations(selectedEpisode.id);
      const preferredTranslation = await getPreferredTranslationFromList(normalizedSeriesId.value, translations as Translation[]);
      const translationId = preferredTranslation ? preferredTranslation.id : translations[0].id;

      return router.replace({
        params: {translationId},
        hash: location.hash,
      });
    });



    return {normalizedSeriesId, normalizedEpisodeNum, normalizedTranslationId};
  },
});
</script>

<style scoped>
.preloader {
  background: black;
  height: 100%;
  display: grid;
  align-items: center;
  justify-content: center;
}
</style>
