import type {DBSchema, IDBPDatabase} from 'idb';
import {openDB} from 'idb';
import type {TranslationAuthor, TranslationType} from '/@/utils/videoProvider';


export interface TranslationRecommendationValue {
  seriesId: number;
  type: TranslationType;
  author: string[];
}


export interface TranslationRecommendations extends DBSchema {
  preferences: {
    value: TranslationRecommendationValue;
    key: number;
    indexes: {
      'by-type': 'sub' | 'voice'
    }
  };
}


let dbPromise: Promise<IDBPDatabase<TranslationRecommendations>> | null = null;


export function getDB(): Promise<IDBPDatabase<TranslationRecommendations>> {

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
