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
    <p v-if="error">
      {{ error }}
      <br>
      <router-link
        v-if="normalizedSeriesId"
        :to="{
          name: 'Watch',
          params: {
            seriesId: normalizedSeriesId,
            episodeNum: '',
            translationId: '',
          }
        }"
      >
        Повторить попытку
      </router-link>
    </p>
    <loading-spinner v-else />
  </div>
</template>

<script lang="ts">
import type {PropType} from 'vue';
import {computed, defineComponent, ref, watchEffect} from 'vue';
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
      type: String as PropType<`${number}`>,
      required: true,
    },
    episodeNum: {
      type: String as PropType<`${number}`>,
      required: false,
      default: '',
    },
    translationId: {
      type: String as PropType<`${number}`>,
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
    const error = ref('');

    watchEffect(async () => {
      if (props.episodeNum) {
        return;
      }

      if (normalizedSeriesId.value === null) {
        error.value = 'Выбранное аниме не найдено';
        return;
      }

        const [episodes, historyItem] = await Promise.all([
          getEpisodes(normalizedSeriesId.value).catch(e => {
            console.error(e);
            return [];
          }),
          getViewHistoryItem(normalizedSeriesId.value),
        ]);

      if (episodes.length === 0) {
        error.value = 'Не было найдено ни одной серии для выбранного аниме';
        return;
      }

      if (historyItem === undefined) {
        return router.replace({params: {episodeNum: episodes[0].number}});
      }


      // По умолчанию начать воспроизведение с эпизода сохранённого в истории
      let selectedEpisodeNum = historyItem.episode.number;

      // Если эпизода сохранённого в истории нет в массиве доступных эпизодов -- выбрать последний
      if (!episodes.find(e => e.number === selectedEpisodeNum)) {
        selectedEpisodeNum = episodes[episodes.length - 1].number;
      }


      // TODO: Проверять что последняя сохранённая серия была досмотрена и открывать следующую
      // const targetEpisodeNum = ...

      return router.replace({
        params: {episodeNum: selectedEpisodeNum},
      });
    });


    watchEffect(async () => {
      if (props.translationId || normalizedEpisodeNum.value === null || normalizedSeriesId.value === null) {
        return;
      }

      const episodes = await getEpisodes(normalizedSeriesId.value);
      let selectedEpisode = episodes.find(e => e.number === normalizedEpisodeNum.value);

      if (!selectedEpisode && normalizedEpisodeNum.value) {
        selectedEpisode = episodes[episodes.length - 1];
      }

      if (!selectedEpisode) {
        error.value = 'Выбранная серия не доступна';
        return;
      }

      const translations = await getTranslations(selectedEpisode.id);
      if (!translations.length) {
        error.value = 'Не было найдено ни одного перевода для выбранной серии';
        return;
      }

      const preferredTranslation = await getPreferredTranslationFromList(normalizedSeriesId.value, translations as Translation[]);
      const translationId = preferredTranslation ? preferredTranslation.id : translations[0].id;

      return router.replace({
        params: {translationId},
      });
    });



    return {normalizedSeriesId, normalizedEpisodeNum, normalizedTranslationId, error};
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
  color: #F1707A;
  text-align: center;
}
</style>
