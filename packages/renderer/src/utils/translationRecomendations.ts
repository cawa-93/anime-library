import type {Translation, TranslationAuthor} from '/@/utils/videoProvider';
import type {DBSchema, IDBPDatabase} from 'idb';
import {openDB} from 'idb';
import type {IndexKey} from 'idb/build/esm/entry';
import {isAuthorsEqual} from '/@/utils/videoProvider/providers/anime365-authors';
import type {MaybeReadonly} from '/@shared/types/utils';
import {trackTime} from '/@/utils/telemetry';


interface TranslationRecommendations extends DBSchema {
  preferences: {
    value: Translation & { seriesId: number };
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

  dbPromise = openDB<TranslationRecommendations>('translation-recommendations', 1, {
    upgrade(db: IDBPDatabase<TranslationRecommendations>, oldVersion: number) {
      if (oldVersion < 1) {
        const preferencesStore = db.createObjectStore('preferences', {keyPath: 'seriesId'});
        preferencesStore.createIndex('by-type', 'type');
      }
    },
  });

  return dbPromise;
}


export async function savePreferredTranslation(seriesId: number, translation: Translation): Promise<number> {
  return getDB().then(db => db.put('preferences', {...translation, seriesId}));
}


function getPreferredTranslationType(): Promise<'sub' | 'voice'> {
  return Promise.all([
    getDB().then(db => db.countFromIndex('preferences', 'by-type', 'sub')),
    getDB().then(db => db.countFromIndex('preferences', 'by-type', 'voice')),
  ]).then(([subCount, voiceCount]) => subCount > voiceCount ? 'sub' : 'voice');
}


//
// async function keyCount<IndexName extends IndexNames<TranslationRecommendations, 'preferences'>>(indexName: IndexName) {
//   const db = await getDB();
//   const transaction = db.transaction('preferences', 'readonly');
//   const index = transaction.objectStore('preferences').index(indexName);
//
//   const countMap = new Map<IndexKey<TranslationRecommendations, 'preferences', IndexName>, number>();
//
//   let cursor = await index.openKeyCursor();
//   while (cursor) {
//     const key = cursor.key as IndexKey<TranslationRecommendations, 'preferences', IndexName>;
//     const value = countMap.get(key) || 0;
//     countMap.set(key, value + 1);
//     cursor = await cursor.continue();
//   }
//
//   await transaction.done;
//
//   return countMap;
// }


/**
 * Возвращает массив авторов, отсортированный по приоритету для пользователя
 */
async function getPreferredTranslationAuthorsByType(preferredType: IndexKey<TranslationRecommendations, 'preferences', 'by-type'>): Promise<TranslationAuthor[]> {
  const all = await getDB().then(db => db.getAllFromIndex('preferences', 'by-type', preferredType));
  if (all.length === 0) {
    return [];
  }

  if (all.length === 1) {
    return [all[0].author];
  }

  const map = new Map<TranslationAuthor['id'], { author: TranslationAuthor, count: number }>();

  all.forEach(({author}) => {
    let saved = map.get(author.id);
    if (!saved) {
      saved = {
        author,
        count: 0,
      };
    }

    saved.count += 1;
    map.set(author.id, saved);
  });

  return Array.from(map.values())
    .filter(s => s.count > 1)
    .sort((a, b) => b.count - a.count)
    .map(s => s.author);
}


export async function getPreferredTranslationFromList<T extends MaybeReadonly<Translation>>(seriesId: number, translations: T[]): Promise<T | undefined> {

  if (!translations || translations.length === 0) {
    return undefined;
  }

  const start = performance.now();

  /**
   * Сохранённый перевод для выбранного аниме
   */
  const reference = await getDB().then(db => db.get('preferences', seriesId));

  // Попытка быстро вернуть перевод, если сразу найдётся совпадение по автору и типу
  if (reference) {
    const preferredTranslation = translations.find(t => t.type === reference.type && isAuthorsEqual(t.author, reference.author));
    if (preferredTranslation) {
      track(performance.now() - start, 'by-reference');
      return preferredTranslation;
    }
  }

  /**
   * Предпочтительный для пользователя {@link TranslationType тип} перевода
   */
  const preferredType = reference?.type || await getPreferredTranslationType();

  /**
   * Массив переводов предпочитаемого {@link TranslationType типа}
   */
  const typedTranslations = translations.filter(t => t.type === preferredType);

  // Если нет ни одного перевода предпочитаемого типа -- просто вернуть первый (любого типа) из всего списка
  if (typedTranslations.length === 0) {
    track(performance.now() - start, 'first-any-type');
    return translations[0];
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
    const preferredTranslation = translations.find(t => isAuthorsEqual(t.author, preferredAuthor));
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
