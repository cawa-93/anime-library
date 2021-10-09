import {contextBridge} from 'electron';
import {randomUUID} from 'crypto';


const uuid: Window['uuid'] = () => {
  return randomUUID();
};

contextBridge.exposeInMainWorld('uuid', uuid);
