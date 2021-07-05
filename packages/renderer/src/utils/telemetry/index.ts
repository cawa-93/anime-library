import {useElectron} from '/@/use/electron';
import type {EventParams, PageViewParams, ScreenViewParams, TimingParams} from '/@/utils/telemetry/types';


const TRACKING_ENABLED = !!import.meta.env.VITE_UA_TRACK_ID;


function getBaseParams() {
  let cid = localStorage.getItem('uuid');
  if (!cid) {
    cid = useElectron().uuid();
    localStorage.setItem('uuid', cid);
  }

  const isNewSession = sessionStorage.getItem('_ga_session_started') === null;
  sessionStorage.setItem('_ga_session_started', String(Date.now()));

  return {
    v: '1',
    ds: 'app',
    dr: document.referrer,
    sr: `${window.screen.width}x${window.screen.height}`,
    vp: `${window.innerWidth}x${window.innerHeight}`,
    ul: navigator.language,
    cid,
    sc: isNewSession ? 'start' : undefined,
    tid: import.meta.env.VITE_UA_TRACK_ID,
    an: 'Anime Library',
    aid: 'com.lib.anime',
    av: import.meta.env.VITE_APP_VERSION,
  } as const;
}


function send(params: PageViewParams | ScreenViewParams | EventParams | TimingParams): void {
  if (TRACKING_ENABLED) {
    const payload = new URLSearchParams(Object.entries(params).filter(([,v]) => v !== undefined && v !== '')).toString();
    navigator.sendBeacon('https://google-analytics.com/collect', payload);
  }
}


export function trackPageView(options: { uri?: string, name?: string } = {}): void {
  if (TRACKING_ENABLED) {
    const payload: PageViewParams & Omit<ScreenViewParams, 't'> = {
      ...getBaseParams(),
      t: 'pageview',
      dp: options?.uri || location.pathname,
      dt: options?.name || document.title,
      cd: options?.name || document.title,
    };

    send(payload);
  }
}


export function trackEvent(event: Partial<EventParams>): void {
  if (TRACKING_ENABLED) {
    const payload: EventParams = {
      ...getBaseParams(),
      t: 'event',
      ...event,
    };

    send(payload);
  }
}


export function trackTime(category: string, variable: string, time: number, label?: string): void {
  if (TRACKING_ENABLED) {
    const payload: TimingParams = {
      ...getBaseParams(),
      t: 'timing',
      utc: category,
      utv: variable,
      utt: Math.round(time),
      utl: label,
    };

    send(payload);
  }
}
