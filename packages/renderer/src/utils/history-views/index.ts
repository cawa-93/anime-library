import type {DBSchema, IDBPDatabase} from 'idb';
import {openDB} from 'idb';
import {getUserRate, isLoggedIn, saveUserRate} from '/@/utils/shikimori-api';


// type HistoryViewsItemStates = 'planned' | 'watching' | 'rewatching' | 'completed' | 'on_hold' | 'dropped'


interface HistoryViewsItem {
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
    // indexes: {
    //   'by-state': HistoryViewsItem['state']
    // }
  };
  meta: Meta
}


type DB = IDBPDatabase<HistoryViews>


let dbPromise: Promise<DB> | null = null;


function getDB() {

  if (dbPromise !== null) {
    return dbPromise;
  }

  dbPromise = openDB<HistoryViews>('history-views', 1, {
    upgrade(db, oldVersion: number) {
      if (oldVersion < 1) {
        db
          .createObjectStore('history', {keyPath: 'seriesId'});
        // .createIndex('by-state', 'state');


        db.createObjectStore('meta');
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
  if (!item.episode || !item.episode.number) {
    return;
  }

  const lastItem = lastCallCache.get(item.seriesId);

  const isCurrentEpisodeFullWatched = ((item.episode.time || 0) >= (item.episode.duration || Infinity) - 60 * 3);
  const isCurrentEpisodeFullWatchedInLastCall = lastItem && lastItem.episode && ((lastItem.episode.time || 0) >= (lastItem.episode.duration || Infinity) - 60 * 3);

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

  await Promise.allSettled([
    saveHistoryItemToDB(item),
    saveHistoryItemToShiki(item),
  ]);
}


export async function getViewHistoryItem(seriesId: number): Promise<HistoryViewsItem | undefined> {
  let savedItem: HistoryViewsItem | undefined = await getDB().then(db => db.get('history', seriesId));
  if (!savedItem && isLoggedIn()) {
    const rate = await getUserRate(seriesId);
    if (rate) {
      savedItem = {
        seriesId,
        updated_at: Math.floor(new Date(rate.updated_at).getTime() / 1000),
        episode: {
          number: rate.episodes + 1,
        },
      };
      console.log({rate, savedItem});
      await saveHistoryItemToDB(savedItem);
    }
  }

  return savedItem;
}
