import type {MaybeRef} from '@vueuse/core';
import type {Translation} from '/@/utils/videoProvider';
import {toRaw, unref} from 'vue';
import {getDB} from '/@/utils/translationRecommendations/getDB';

/**
 * Для каждого аниме в базе данных хранится массив предпочитаемых авторов
 * Этота константа ограничивает количество сохранённых авторов на один сериал
 * Необходимо для экономии памяти в хранилище
 */
const PREFERRED_AUTHORS_PER_SERIES_LIMIT = 5;


export async function savePreferredTranslation(seriesId: number, translationRef: MaybeRef<Translation>): Promise<number> {
  const translation = toRaw(unref(translationRef));
  const authorId = translation?.author?.id;
  if (!authorId) {
    return -1;
  }

  const db = await getDB();
  const tx = db.transaction('preferences', 'readwrite');
  const savedTranslation = await tx.store.get(seriesId);
  const savedAuthors = (savedTranslation && savedTranslation.type === translation.type && savedTranslation.author)
    ? savedTranslation.author
    : [];

  const authorsToSave = [authorId, ...savedAuthors.filter(id => id !== authorId)].slice(0, PREFERRED_AUTHORS_PER_SERIES_LIMIT);

  return getDB().then(db => db.put(
    'preferences',
    {
      type: translation.type,
      seriesId,
      author: authorsToSave,
    }));
}
