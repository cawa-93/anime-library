import type {Ref} from 'vue';
import {ref, watch} from 'vue';
import type {Episode, Translation} from '/@/utils/videoProvider';
import {getTranslationsList} from '/@/utils/prepareWatchData';


export default function (currentEpisode: Ref<Episode | undefined>, seriesId: string | number, translationId?: string | number) {
  const translations = ref<Translation[]>([]);
  const currentTranslation = ref<Translation | undefined>();
  const error = ref('');

  watch(currentEpisode, (currentEpisode, oldCurrentEpisode) => {
    if (currentEpisode && oldCurrentEpisode && currentEpisode.id === oldCurrentEpisode.id) {
      return;
    }

    error.value = '';
    translations.value = [];
    currentTranslation.value = undefined;

    if (!currentEpisode) {
      return;
    }


    getTranslationsList(currentEpisode.id, seriesId, !translationId ? undefined : translationId).then(data => {
      const {translations: trs, startTranslation} = data;

      if (trs.length === 0) {
        error.value = 'Не найдено ни одного перевода для выбранной серии';
        return;
      }

      translations.value = trs;

      if (startTranslation !== undefined) {
        currentTranslation.value = startTranslation;
      }
    });
  }, {immediate: true});

  return {
    error,
    translations,
    startTranslation: currentTranslation,
  };
}
