import type {DBSchema, IDBPDatabase} from 'idb';
import {openDB} from 'idb';
import {getUserRate, isLoggedIn, saveUserRate} from '/@/utils/shikimori-api';
import {isEpisodeCompleted} from '/@/utils/isEpisodeCompleted';
import {DAY} from '/@/utils/time';


// type HistoryViewsItemStates = 'planned' | 'watching' | 'rewatching' | 'completed' | 'on_hold' | 'dropped'


export interface HistoryViewsItem {
  seriesId: number,
  episode: {
    number: number,
    time?: number,
    duration?: number
  },
  // state: HistoryViewsItemStates,
  updated_at?: number
}



interface MetaLastUpdate {
  key: 'last_synced_at'
  value: number
}


type Meta = MetaLastUpdate


interface HistoryViews extends DBSchema {
  history: {
    value: HistoryViewsItem;
    key: HistoryViewsItem['seriesId'];
    indexes: {
      'by-updated-at': number
      //   'by-state': HistoryViewsItem['state']
    }
  };
  meta: Meta
}


type DB = IDBPDatabase<HistoryViews>


let dbPromise: Promise<DB> | null = null;


function getDB() {

  if (dbPromise !== null) {
    return dbPromise;
  }

  dbPromise = openDB<HistoryViews>('history-views', 2, {
    upgrade(db, oldVersion, _newVersion, transaction) {
      if (oldVersion < 1) {
        db.createObjectStore('history', {keyPath: 'seriesId'});
        db.createObjectStore('meta');
      }

      if (oldVersion < 2) {
        transaction.objectStore('history').createIndex('by-updated-at', 'updated_at');
      }
    },
  });

  return dbPromise;
}


function saveHistoryItemToDB(item: HistoryViewsItem): Promise<number> {
  return getDB().then(db => db.put('history', item));
}



/**
 * Сохраняет серию и прогресс просмотра в локальную базу данных и на Шикимори
 * @param item
 */
export async function putHistoryItem(item: HistoryViewsItem): Promise<HistoryViewsItem> {
  const savedItem = await getViewHistoryItem(item.seriesId);

  if (savedItem) {
    item = Object.assign({}, savedItem, item);
  }

  item.updated_at = Math.floor(Date.now() / 1000);

  /**
   * Синхронизация с Шикимори
   * Отключена в режиме разработки
   */
  if (import.meta.env.MODE !== 'development') {
    const seriesId = item.seriesId;
    let episode = item.episode.number;

    /**
     * Если текущий эпизод не просмотрен до конца то на Шики нужно отмечать просмотренным предыдущий эпизод
     */
    if (item.episode.time && item.episode.duration && !isEpisodeCompleted(item.episode.time, item.episode.duration)) {
      episode = Math.max(0, item.episode.number - 1);
    }

    saveUserRate(seriesId, episode).catch(console.error);
  }

  await saveHistoryItemToDB(item);

  return item;
}


export async function getViewHistoryItem(seriesId: number, allowNetworkFetch = true): Promise<HistoryViewsItem | undefined> {
  let savedItem: HistoryViewsItem | undefined = await getDB().then(db => db.get('history', seriesId));
  if (!savedItem && allowNetworkFetch && isLoggedIn()) {
    const rate = await getUserRate(seriesId);
    if (rate) {
      savedItem = {
        seriesId,
        updated_at: Math.floor(new Date(rate.updated_at).getTime() / 1000),
        episode: {
          number: rate.episodes + 1,
        },
      };
      await saveHistoryItemToDB(savedItem);
    }
  }

  return savedItem;
}


export function getHistoryItems(limit = 10): Promise<HistoryViewsItem[]> {
  return getDB()
    .then(db => db.getAllFromIndex('history', 'by-updated-at', IDBKeyRange.lowerBound((Date.now()/1000) - DAY * 20)))
    .then(items => items.splice(-limit).reverse());
}
