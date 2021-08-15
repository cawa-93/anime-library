import {useElectron} from '/@/use/electron';
import type {EventParams, PageViewParams, ScreenViewParams, TimingParams} from '/@/utils/telemetry/types';
import {isLoggedIn} from '/@/utils/shikimori-api';
import {isEnabled as isTimelineThumbnailsEnabled} from '/@/components/Options/TimelineThumbnails.vue';
import {isEnabled as isEnableHardwareAccelerationEnabled} from '/@/components/Options/EnableHardwareAcceleration.vue';

const TRACKING_ID = import.meta.env.VITE_UA_TRACK_ID;
const TRACKING_ENABLED = TRACKING_ID !== undefined;
/**
 * Сохранённое состояние параметра isEnableHardwareAccelerationEnabled
 * Необходимо заранее загрузить его значение, чтобы в дальнейшем использовать в синхронных функциях
 * Параметр не изменяется без перезагрузки страницы
 */
let _isEnableHardwareAccelerationEnabled: boolean | undefined = undefined;
isEnableHardwareAccelerationEnabled().then(v => _isEnableHardwareAccelerationEnabled = v);


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
    tid: TRACKING_ID || '',
    an: 'Anime Library',
    aid: 'com.lib.anime',
    av: import.meta.env.VITE_APP_VERSION || '',
    cd1: isLoggedIn() ? 'connected' : 'not-connected',
    cd2: isTimelineThumbnailsEnabled() ? 'enabled' : 'disabled',
    cd3: _isEnableHardwareAccelerationEnabled === undefined ? undefined : _isEnableHardwareAccelerationEnabled ? 'enabled' : 'disabled',
    cd4: window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light',
  } as const;
}


function send(params: PageViewParams | ScreenViewParams | EventParams | TimingParams): void {
  if (TRACKING_ENABLED) {
    const payload = new URLSearchParams(Object.entries(params).filter(([, v]) => v !== undefined && v !== '')).toString();
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


export function trackEvent(category: string, action: string, label?: string, value?: number): void {
  if (TRACKING_ENABLED) {
    const payload: EventParams = {
      ...getBaseParams(),
      t: 'event',
      ec: category,
      ea: action,
      el: label,
      ev: value,
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


export function startTrackingWindowVisibility(targetVisibilityState?: VisibilityState): void {
  if (TRACKING_ENABLED) {
    document.addEventListener('visibilitychange', () => {
      if (!targetVisibilityState || document.visibilityState === targetVisibilityState) {
        trackEvent('main_window_visibility', `window_${document.visibilityState}`);
      }
    });
  }
}
