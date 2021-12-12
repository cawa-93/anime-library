import {contextBridge} from 'electron';
import {randomUUID} from 'crypto';


const uuid = () => {
  return randomUUID();
};

contextBridge.exposeInMainWorld('uuid', uuid);
