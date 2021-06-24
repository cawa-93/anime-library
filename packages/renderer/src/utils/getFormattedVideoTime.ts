import {HOUR, SECOND_MS} from '/@/utils/time';


export function getFormattedVideoTime(seconds: number): string {
  const d = new Date(seconds * SECOND_MS);

  const options: Intl.DateTimeFormatOptions = {minute: 'numeric', second: 'numeric', timeZone: 'UTC'};
  if (seconds >= HOUR) {
    options.hour = 'numeric';
  }

  return d.toLocaleTimeString('ru', options);
}
