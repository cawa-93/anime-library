import type {DBSchema, IDBPDatabase} from 'idb';
import {openDB} from 'idb';
import {getUserRate, isLoggedIn, saveUserRate} from '/@/utils/shikimori-api';
import {isEpisodeCompleted} from '/@/utils/isEpisodeCompleted';


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
 * Хранит параметры с предыдущего вызова {@link saveHistoryItemToShiki}
 * Необходим, чтобы не выполнять много однотипных запросов к апи Шикимори
 */
const lastCallCache = new Map<number, HistoryViewsItem>();


function saveHistoryItemToShiki(item: HistoryViewsItem): void {
  // В режиме разработки отключить синхронизацию с шикимори
  // Иначе это засоряет профиль Шики десятками изменений в истории
  if (import.meta.env.MODE === 'development') {
    return;
  }

  if (!item.episode || !item.episode.number) {
    return;
  }

  const lastItem = lastCallCache.get(item.seriesId);

  const isCurrentEpisodeFullWatched = isEpisodeCompleted(item.episode.time || 0, item.episode.duration || Infinity);
  const isCurrentEpisodeFullWatchedInLastCall = lastItem && lastItem.episode && isEpisodeCompleted(lastItem.episode.time || 0, lastItem.episode.duration || Infinity);

  if (!lastItem
    || !lastItem.episode
    || (item.episode.number && item.episode.number !== lastItem.episode.number)
    || isCurrentEpisodeFullWatched !== isCurrentEpisodeFullWatchedInLastCall
  ) {
    saveUserRate(item.seriesId, isCurrentEpisodeFullWatched ? item.episode.number : Math.max(0, item.episode.number - 1))
      .catch(console.error);
  }

  lastCallCache.set(item.seriesId, item);
}



export async function putHistoryItem(item: HistoryViewsItem): Promise<void> {
  const savedItem = await getViewHistoryItem(item.seriesId);

  if (savedItem) {
    item = Object.assign({}, savedItem, item);
  }

  item.updated_at = Math.floor(Date.now() / 1000);

  saveHistoryItemToShiki(item);
  await saveHistoryItemToDB(item);
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


export function getHistoryItems(limit = 5): Promise<HistoryViewsItem[]> {
  return getDB()
    .then(db => db.getAllFromIndex('history', 'by-updated-at'))
    .then(items => items.splice(-limit).reverse());
}
