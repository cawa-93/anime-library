import type {TranslationRecommendations} from '/@/utils/translationRecommendations/getDB';
import {getDB} from '/@/utils/translationRecommendations/getDB';
import type {IndexKey} from 'idb/build/esm/entry';


/**
 * @param preferredType Тип переводов по которому фильтровать авторов
 * Возвращает массив авторов, отфильтрованных по типу и отсортированный по приоритету для пользователя
 */
export async function getPreferredTranslationAuthorsByType(preferredType: IndexKey<TranslationRecommendations, 'preferences', 'by-type'>): Promise<string[]> {
  const translations = await getDB().then(db => db.getAllFromIndex('preferences', 'by-type', preferredType));
  if (translations.length === 0) {
    return [];
  }

  if (translations.length === 1) {
    return translations[0].author;
  }

  const map = new Map<string, number>();

  translations.forEach(({author}) =>
    author.forEach(id => map.set(id, (map.get(id) || 0) + 1)),
  );

  return Array.from(map.entries())
    .filter(([id, count]) => id && count >= 1)
    .sort(([, a], [, b]) => b - a)
    .map(([id]) => id);
}
