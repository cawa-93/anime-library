import type {Translation} from '/@/utils/videoProvider';
import {getTranslations} from '/@/utils/videoProvider';
import type {Ref} from 'vue';
import {ref, unref, watch} from 'vue';
import {getPreferredTranslationFromList} from '/@/utils/translationRecommendations/getPreferredTranslationFromList';


const cache = new Map<number, { translations: Translation[], selectedTranslation: Translation | undefined }>();

type useTranslationsReturn = {
  readonly translations: Ref<Translation[]>,
  readonly selectedTranslation: Ref<Translation | undefined>,
  readonly isEvaluating: Ref<boolean>,
  readonly preload: (id: number | string) => Promise<{ translations: Translation[], selectedTranslation: Translation | undefined }>
}


export function useTranslations(
  episodeId: Ref<number | string | undefined | null>,
  seriesId: number | string,
): useTranslationsReturn {
  const evaluating = ref(true);

  const $selectedTranslation = ref<Translation | undefined>();
  const $translations = ref<Translation[]>([]);

  watch(episodeId, async () => {

    evaluating.value = true;

    try {
      const id = Number(unref(episodeId));

      if (!id) {
        return;
      }

      const cached = cache.get(Number(id));
      if (cached) {
        $translations.value = cached.translations;
        $selectedTranslation.value = cached.selectedTranslation;
        cache.delete(id);
        return;
      }

      const translations = await getTranslations(id);
      const selectedTranslation = await getPreferredTranslationFromList(Number(seriesId), translations);

      $translations.value = translations;
      $selectedTranslation.value = selectedTranslation;
    } finally {
      evaluating.value = false;
    }
  });

  const preload = async (id: number | string) => {
    const cached = cache.get(Number(id));

    if (cached) {
      return cached;
    }

    const translations = await getTranslations(id);
    const selectedTranslation = await getPreferredTranslationFromList(Number(seriesId), translations);

    cache.set(Number(id), {translations, selectedTranslation});

    return {translations, selectedTranslation};
  };

  return {
    translations: $translations,
    selectedTranslation: $selectedTranslation,
    isEvaluating: evaluating,
    preload,
  };
}
