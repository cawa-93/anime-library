import type {Ref} from 'vue';
import {ref} from 'vue';
import {getAppVersion} from '/@/utils/app';

let cachedAppVersion: string | null = null;

export function useAppVersion(): Ref<string> {
  const version = ref(cachedAppVersion || '');
  if (!cachedAppVersion) {
    getAppVersion().then(v => {
      version.value = v;
      cachedAppVersion = v;
    });
  }
  return version;
}
