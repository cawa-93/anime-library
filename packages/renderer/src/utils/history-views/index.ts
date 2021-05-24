import type {DBSchema, IDBPDatabase} from 'idb';
import {openDB} from 'idb';


type HistoryViewsHistoryItemStates = 'planned' | 'watching' | 'rewatching' | 'completed' | 'on_hold' | 'dropped'


interface HistoryViewsHistoryItem {
  seriesId: number,
  episode: {
    number: number,
    time: number,
    duration: number
  },
  state: HistoryViewsHistoryItemStates,
  updated_at: number
}



interface MetaLastUpdate {
  key: 'last_synced_at'
  value: number
}


type Meta = MetaLastUpdate


interface HistoryViews extends DBSchema {
  history: {
    value: HistoryViewsHistoryItem;
    key: HistoryViewsHistoryItem['seriesId'];
    indexes: {
      'by-state': HistoryViewsHistoryItem['state']
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

  dbPromise = openDB<HistoryViews>('history-views', 1, {
    upgrade(db, oldVersion: number) {
      if (oldVersion < 1) {
        db
          .createObjectStore('history', {keyPath: 'seriesId'})
          .createIndex('by-state', 'state');


        db.createObjectStore('meta');
      }
    },
  });

  return dbPromise;
}


export function save(item: Omit<HistoryViewsHistoryItem, 'updated_at'>): Promise<number> {
  const itemToSave: HistoryViewsHistoryItem = {
    ...item,
    updated_at: Math.floor(Date.now() / 1000),
  };

  return getDB().then(db => db.put('history', itemToSave));
}


export function getViewHistoryItem(seriesId: number): Promise<HistoryViewsHistoryItem | undefined> {
  return getDB().then(db => db.get('history', seriesId));
}
