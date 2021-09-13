import type {EventHookOn} from '@vueuse/core';
import {createEventHook, tryOnBeforeUnmount} from '@vueuse/core';
import {capitalize} from '/@/utils/capitalize';


type useMediaSessionActionsReturn<T extends MediaSessionAction[] = []> = {
  [K in `on${Capitalize<T[number]>}`]: K extends 'onSeekto'
    ? EventHookOn<Required<Pick<MediaSessionActionDetails, 'seekTime'>> & MediaSessionActionDetails>
    : EventHookOn<MediaSessionActionDetails>;
}


export function useMediaSessionActions<T extends MediaSessionAction[] = []>(actions: T): useMediaSessionActionsReturn<T> {
  const handlers = {} as useMediaSessionActionsReturn<T>;

  for (const key of actions) {
    const action = key as T[number];
    const hook = createEventHook();

    navigator.mediaSession.setActionHandler(action, hook.trigger);
    handlers[`on${capitalize(action)}`] = hook.on;

    tryOnBeforeUnmount(() => {
      navigator.mediaSession.setActionHandler(action, null);
    });
  }

  return handlers;
}
