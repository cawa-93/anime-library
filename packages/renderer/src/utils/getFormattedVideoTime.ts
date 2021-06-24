import {HOUR, SECOND_MS} from '/@/utils/time';


const MIN_SEC = new Intl.DateTimeFormat('ru', {
  minute: 'numeric',
  second: 'numeric',
  timeZone: 'UTC',
});

const HOUR_MIN_SEC = new Intl.DateTimeFormat('ru', {
  minute: 'numeric',
  second: 'numeric',
  hour: 'numeric',
  timeZone: 'UTC',
});


export function getFormattedVideoTime(seconds: number): string {
  return (seconds >= HOUR ? HOUR_MIN_SEC : MIN_SEC).format(seconds * SECOND_MS);
}
