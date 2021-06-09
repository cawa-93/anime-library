import type {DBSchema, IDBPDatabase} from 'idb';
import {openDB} from 'idb';


export interface CustomList {
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
  data: CustomList
  id: number
}


interface CustomListsDBSchema extends DBSchema {
  ['custom-lists']: {
    value: DBItem,
    key: number
  }
}


type DB = IDBPDatabase<CustomListsDBSchema>

let dbPromise: Promise<DB> | null = null;


function getDB() {
  if (dbPromise !== null) {
    return dbPromise;
  }

  dbPromise = openDB<CustomListsDBSchema>('user-custom-lists', 1, {
    upgrade(db, oldVersion) {
      if (oldVersion < 1) {
        db.createObjectStore('custom-lists', {keyPath: 'id', autoIncrement: true});
      }
    },
  });

  return dbPromise;

}


export function putCustomList(data: CustomList, id?: number): Promise<number> {
  return getDB().then(db => {
    if (id) {
      return db.put('custom-lists', {data, id});
    }

    return db.add('custom-lists', {data} as DBItem);
  });
}

export function getAllCustomLists(): Promise<{data: CustomList, id: number}[]> {
  return getDB().then(db => db.getAll('custom-lists'));
}

export function deleteCustomList(id: number): Promise<void> {
  return getDB().then(db => db.delete('custom-lists', id));
}
