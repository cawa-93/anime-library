import type {Translation} from '/@/utils/videoProvider';
import type {DBSchema, IDBPDatabase } from 'idb';
import {openDB} from 'idb';


interface TranslationRecommendations extends DBSchema {
  preferences: {
    value: Translation & {seriesId: number};
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


export async function savePreferredTranslation(seriesId: NumberLike, translation: Translation): Promise<number> {
  if (typeof seriesId !== 'number') {
    seriesId = Number(seriesId);
  }

  return (await getDB()).put('preferences', {...translation, seriesId});
}
