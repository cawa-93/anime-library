import {useElectron} from '/@/use/electron';


const TRACKING_ENABLED = !!import.meta.env.VITE_UA_TRACK_ID;

interface TrackParams {
  v?: '1'
  ds?: 'web' | 'app'
  dr?: string
  tid?: string
  z?: string
  cid?: string
  uid?: string
  sc?: 'start' | 'end'
  /** Строка в формате `${number}x${number}` */
  sr?: string
  /** Строка в формате `${number}x${number}` */
  vp?: string
  ul?: string
  t?: 'pageview' | 'screenview' | 'event' | 'transaction' | 'item' | 'social' | 'exception' | 'timing'
  ni?: 1 | 0
  dp?: string
  dt?: string
  cd?: string
  an?: string
  aid?: string
  av?: string
  ec?: string
  ea?: string
  el?: string
  ev?: number
  utc?: string
  utv?: string
  utt?: number
  utl?: string
}

function getBaseParams(): TrackParams {

  let cid = localStorage.getItem('uuid');
  if (!cid) {
    cid = useElectron().uuid();
    localStorage.setItem('uuid', cid);
  }

  return {
    v: '1',
    ds: 'app',
    dr: document.referrer,
    sr: `${window.screen.width}x${window.screen.height}`,
    vp: `${window.innerWidth}x${window.innerHeight}`,
    ul: navigator.language,
    cid,
    tid: import.meta.env.VITE_UA_TRACK_ID,
    an: 'Anime Library',
    aid: 'com.lib.anime',
    av: import.meta.env.VITE_APP_VERSION,
  };
}


function send(body: string) {
  return fetch('https://google-analytics.com/collect', {
    method: 'POST',
    body,
  });
}


export async function trackPageView(options: { uri?: string, name?: string } = {}, additionParams: TrackParams = {}): Promise<void> {
  if (TRACKING_ENABLED) {
    const payload: TrackParams = {
      ...getBaseParams(),
      t: 'pageview',
      dp: options?.uri || location.pathname,
      dt: options?.name || document.title,
      cd: options?.name || document.title,
      ...additionParams,
    };

    await send(new URLSearchParams(payload as Record<string, string>).toString());
  }
}

export async function trackEvent(event: TrackParams): Promise<void> {
  if (TRACKING_ENABLED) {
    const payload: TrackParams = {
      ...getBaseParams(),
      t: 'event',
      ...event,
    };

    await send(new URLSearchParams(payload as Record<string, string>).toString());
  }
}


export async function trackTime(category: string, variable: string, time: number, label?: string, additionParams: TrackParams = {}): Promise<void> {
  if (TRACKING_ENABLED) {
    console.log({time, label});
    const payload: TrackParams = {
      ...getBaseParams(),
      t: 'timing',
      utc: category,
      utv: variable,
      utt: Math.round(time),
      utl: label,
      ...additionParams,
    };

    await send(new URLSearchParams(payload as Record<string, string>).toString());
  }
}
