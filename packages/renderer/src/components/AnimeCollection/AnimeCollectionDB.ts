import type {DBSchema, IDBPDatabase} from 'idb';
import {openDB} from 'idb';


export interface AnimeCollection {
  title: string,
  requestParams: {
    status: string
    kind: string
    order: string
    limit: number
    mylist: string
  }
}

type DBItem = {
  data: AnimeCollection
  id: number
}


interface AnimeCollectionDBSchema extends DBSchema {
  ['custom-lists']: {
    value: DBItem,
    key: number
  }
}


type DB = IDBPDatabase<AnimeCollectionDBSchema>

let dbPromise: Promise<DB> | null = null;


function getDB() {
  if (dbPromise !== null) {
    return dbPromise;
  }

  dbPromise = openDB<AnimeCollectionDBSchema>('user-custom-lists', 1, {
    upgrade(db, oldVersion) {
      if (oldVersion < 1) {
        db.createObjectStore('custom-lists', {keyPath: 'id', autoIncrement: true});
      }
    },
  });

  return dbPromise;

}


export function putCollection(data: AnimeCollection, id?: number): Promise<number> {
  return getDB().then(db => {
    if (id) {
      return db.put('custom-lists', {data, id});
    }

    return db.add('custom-lists', {data} as DBItem);
  });
}

export function getAllCollections(): Promise<{data: AnimeCollection, id: number}[]> {
  return getDB().then(db => db.getAll('custom-lists'));
}

export function deleteCollection(id: number): Promise<void> {
  return getDB().then(db => db.delete('custom-lists', id));
}

export function getCollectionById(id: number): Promise<DBItem | undefined> {
  return getDB().then(db => db.get('custom-lists', id));
}
