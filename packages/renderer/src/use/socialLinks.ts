import {useElectron} from '/@/use/electron';
import {trackEvent} from '/@/utils/telemetry';


const {openURL} = useElectron();


export function openVK(): Promise<void> {
  trackEvent({
    ec: 'Social',
    ea: 'Click on social link',
    el: 'VK',
  });
  return openURL('https://vk.com/playshikionline');
}


export function openTG(): Promise<void> {
  trackEvent({
    ec: 'Social',
    ea: 'Click on social link',
    el: 'TG',
  });
  return openURL('https://t.me/playshikionline');
}


export function openGitHub(): Promise<void> {
  trackEvent({
    ec: 'Social',
    ea: 'Click on social link',
    el: 'GitHub',
  });
  return openURL('https://github.com/cawa-93/anime-library');
}
