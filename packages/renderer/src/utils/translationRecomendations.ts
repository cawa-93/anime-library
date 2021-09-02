import type {Translation, TranslationAuthor, TranslationType} from '/@/utils/videoProvider';
import type {DBSchema, IDBPDatabase} from 'idb';
import {openDB} from 'idb';
import type {IndexKey} from 'idb/build/esm/entry';
import type {MaybeReadonly} from '/@shared/types/utils';
import {trackTime} from '/@/utils/telemetry';
import type {MaybeRef} from '@vueuse/core';
import {toRaw} from 'vue';


interface TranslationRecommendations extends DBSchema {
  preferences: {
    value: { seriesId: number, type: TranslationType, author: string[] };
    key: number;
    indexes: {
      'by-type': 'sub' | 'voice'
    }
  };
}


let dbPromise: Promise<IDBPDatabase<TranslationRecommendations>> | null = null;


function getDB() {

  if (dbPromise !== null) {
    return dbPromise;
  }

  dbPromise = openDB<TranslationRecommendations>('translation-recommendations', 2, {
    async upgrade(db: IDBPDatabase<TranslationRecommendations>, oldVersion, _, transaction) {
      if (oldVersion < 1) {
        const preferencesStore = db.createObjectStore('preferences', {keyPath: 'seriesId'});
        preferencesStore.createIndex('by-type', 'type');
      }

      if (oldVersion < 2) {
        const preferencesStore = transaction.objectStore('preferences');
        let cursor = await preferencesStore.openCursor();


        while (cursor) {
          // @ts-expect-error Ранее author сохранялся с типом TranslationAuthor но после этой миграции должен храниться как string[]
          const author = cursor.value.author as TranslationAuthor;
          if (author.id) {
            cursor.update({
              type: cursor.value.type,
              seriesId: cursor.value.seriesId,
              author: [author.id],
            });
          } else {
            cursor.delete();
          }
          cursor = await cursor.continue();
        }
      }
    },
  });

  return dbPromise;
}


/**
 * Для каждого аниме в базе данных хранится массив предпочитаемых авторов
 * Этота константа ограничивает количество сохранённых авторов на один сериал
 * Необходимо для экономии памяти в хранилище
 */
const PREFERRED_AUTHORS_PER_SERIES_LIMIT = 5;


export async function savePreferredTranslation(seriesId: number, translationRef: MaybeRef<Translation>): Promise<number> {
  const translation = toRaw(translationRef) as Translation;
  const authorId = translation.author.id;
  if (!authorId) {
    return -1;
  }

  const db = await getDB();
  const tx = db.transaction('preferences', 'readwrite');
  const savedTranslation = await tx.store.get(seriesId);
  const savedAuthors = savedTranslation?.type === translation.type
    ? savedTranslation?.author || []
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


function getPreferredTranslationType(): Promise<'sub' | 'voice'> {
  return Promise.all([
    getDB().then(db => db.countFromIndex('preferences', 'by-type', 'sub')),
    getDB().then(db => db.countFromIndex('preferences', 'by-type', 'voice')),
  ]).then(([subCount, voiceCount]) => subCount > voiceCount ? 'sub' : 'voice');
}


/**
 * Возвращает массив авторов, отсортированный по приоритету для пользователя
 */
async function getPreferredTranslationAuthorsByType(preferredType: IndexKey<TranslationRecommendations, 'preferences', 'by-type'>): Promise<string[]> {
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


export async function getPreferredTranslationFromList<T extends MaybeReadonly<Translation>>(seriesId: number, availableTranslations: T[]): Promise<T | undefined> {

  if (!availableTranslations || availableTranslations.length === 0) {
    return undefined;
  }

  const start = performance.now();

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
      track(performance.now() - start, 'by-reference');
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
    track(performance.now() - start, 'first-any-type');
    return availableTranslations[0];
  }

  // Быстро вернуть перевод предпочитаемого типа если он всего один
  if (typedTranslations.length === 1) {
    track(performance.now() - start, 'first-preferred-type');
    return typedTranslations[0];
  }

  const preferredAuthors = await getPreferredTranslationAuthorsByType(preferredType);
  // Если нет предпочитаемых авторов -- вернуть первый подходящий перевод
  if (preferredAuthors.length === 0) {
    track(performance.now() - start, 'has-no-preferred-authors');
    return typedTranslations[0];
  }

  // Попытка найти среди доступных перевод от одного из предпочитаемых авторов по порядку их приоритета
  for (const preferredAuthor of preferredAuthors) {
    const preferredTranslation = availableTranslations.find(t => t.author.id === preferredAuthor);
    if (preferredTranslation) {
      track(performance.now() - start, 'by-preferred-authors');
      return preferredTranslation;
    }
  }

  // Если ни один из вариантов поиска не дал результат -- вернуть первый доступный перевод
  track(performance.now() - start, 'fallback');
  return typedTranslations[0];
}


function track(time: number, label?: string) {
  return trackTime('Translation Recommendations', 'Search Preferred Translation', time, label);
}
