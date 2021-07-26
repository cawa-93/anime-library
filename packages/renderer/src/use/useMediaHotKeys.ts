import {useEventListener} from '@vueuse/core';


type SupportedActions =
  'playingPause'
  | 'playingToggle'
  | 'previousTrack'
  | 'nextTrack'
  | 'fastForward'
  | 'fastBackward'
  | 'volumeMuteToggle'
  | 'volumeUp'
  | 'volumeDown'


interface Action {
  action: SupportedActions
  ignore?(e: KeyboardEvent): boolean
}


const matchBySelector = (event: KeyboardEvent, selector: string): boolean => {
  if (!event?.target || event.target === document.body || !(event.target instanceof HTMLElement)) {
    return false;
  }

  return event.target.matches(selector);
};

const keys = new Map<KeyboardEvent['code'], Action>([
  ['Space', {
    action: 'playingToggle',
    ignore: e => matchBySelector(e, 'textarea, button, select, input:not([type=range])'),
  }],
  ['MediaPlayPause', {action: 'playingToggle'}],
  ['KeyK', {action: 'playingToggle'}],

  ['Pause', {action: 'playingPause'}],
  ['MediaStop', {action: 'playingPause'}],

  ['MediaTrackPrevious', {action: 'previousTrack'}],
  ['MediaTrackNext', {action: 'nextTrack'}],
  ['KeyN', {action: 'nextTrack', ignore: e => !e.shiftKey}],

  ['ArrowLeft', {action: 'fastBackward', ignore: e => matchBySelector(e, 'input, textarea, select')}],
  ['KeyJ', {action: 'fastBackward'}],

  ['ArrowRight', {action: 'fastForward', ignore: e => matchBySelector(e, 'input, textarea, select')}],
  ['KeyL', {action: 'fastForward'}],

  ['KeyM', {action: 'volumeMuteToggle'}],

  ['VolumeUp', {action: 'volumeUp'}],
  ['ArrowUp', {action: 'volumeUp', ignore: e => matchBySelector(e, 'input, textarea, select')}],

  ['VolumeDown', {action: 'volumeDown'}],
  ['ArrowDown', {action: 'volumeDown', ignore: e => matchBySelector(e, 'input, textarea, select')}],
]);

type MediaControls = {
  playingToggle?: (event: KeyboardEvent) => void
  playingPause?: (event: KeyboardEvent) => void
  previousTrack?: (event: KeyboardEvent) => void
  nextTrack?: (event: KeyboardEvent) => void
  fastForward?: (event: KeyboardEvent) => void
  fastBackward?: (event: KeyboardEvent) => void
  volumeMuteToggle?: (event: KeyboardEvent) => void
  volumeUp?: (event: KeyboardEvent) => void
  volumeDown?: (event: KeyboardEvent) => void
}


export function useMediaHotKeys(controls: MediaControls): void {
  useEventListener('keydown', (event) => {
    const shortcut = keys.get(event.code);
    if (!shortcut) {
      return;
    }

    if (shortcut.ignore && shortcut.ignore(event)) {
      return;
    }

    const targetAction = controls[shortcut.action];
    if (!targetAction) {
      return;
    }

    targetAction(event);
  });
}
