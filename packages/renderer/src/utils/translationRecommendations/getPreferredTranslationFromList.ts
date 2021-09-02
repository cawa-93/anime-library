import type {MaybeReadonly} from '/@shared/types/utils';
import type {Translation} from '/@/utils/videoProvider';
import {getDB} from '/@/utils/translationRecommendations/getDB';
import {getPreferredTranslationAuthorsByType} from '/@/utils/translationRecommendations/getPreferredTranslationAuthorsByType';
import {getPreferredTranslationType} from '/@/utils/translationRecommendations/getPreferredTranslationType';


export async function getPreferredTranslationFromList<T extends MaybeReadonly<Translation>>(seriesId: number, availableTranslations: T[] | null | undefined): Promise<T | undefined> {

  if (!availableTranslations || availableTranslations.length === 0) {
    return undefined;
  }

  /**
   * Сохранённый перевод для выбранного аниме
   */
  const reference = await getDB().then(db => db.get('preferences', seriesId));
  // Попытка быстро вернуть перевод, если сразу найдётся совпадение по автору и типу
  if (reference) {

    /**
     * Перевод который соответствует тому, что сохранен в базе данных
     */
    let foundTranslation: T | null = null;

    /**
     * Приоритет найденного перевода. От 0 до Infinity где
     * 0 -- Самый ВЫСОКИЙ приоритет. Infinity -- Самый НИЗКИЙ приоритет
     * В {@link reference} гранится несколько предпочитаемых авторов.
     * Приоритет нужен для того, чтобы из них выбраться самого приоритетного для пользователя
     **/
    let priorityOfFoundTranslation = Infinity;

    for (const translation of availableTranslations) {
      if (translation.type !== reference.type || !translation.author.id) {
        continue;
      }

      const priority = reference.author.findIndex(authorId => authorId === translation.author.id);

      // Если нашли перевод с найвысшим приоритетом -- остановить цикл так как в дальнейшем поиске нет смысла
      if (priority === 0) {
        foundTranslation = translation;
        break;
      } else if (priority > 0 && priority < priorityOfFoundTranslation) {
        foundTranslation = translation;
        priorityOfFoundTranslation = priority;
      }
    }

    if (foundTranslation) {
      return foundTranslation;
    }
  }

  /**
   * Предпочтительный для пользователя {@link TranslationType тип} перевода
   */
  const preferredType = reference?.type || await getPreferredTranslationType();

  /**
   * Массив переводов предпочитаемого {@link TranslationType типа}
   */
  const typedTranslations = availableTranslations.filter(t => t.type === preferredType);


  // Если нет ни одного перевода предпочитаемого типа -- просто вернуть первый (любого типа) из всего списка
  if (typedTranslations.length === 0) {
    return availableTranslations[0];
  }

  // Быстро вернуть перевод предпочитаемого типа если он всего один
  if (typedTranslations.length === 1) {
    return typedTranslations[0];
  }

  const preferredAuthors = await getPreferredTranslationAuthorsByType(preferredType);
  // Если нет предпочитаемых авторов -- вернуть первый подходящий перевод
  if (preferredAuthors.length === 0) {
    return typedTranslations[0];
  }

  // Попытка найти среди доступных перевод от одного из предпочитаемых авторов по порядку их приоритета
  for (const preferredAuthor of preferredAuthors) {
    const preferredTranslation = availableTranslations.find(t => t.author.id === preferredAuthor);
    if (preferredTranslation) {
      return preferredTranslation;
    }
  }

  // Если ни один из вариантов поиска не дал результат -- вернуть первый доступный перевод
  return typedTranslations[0];
}
