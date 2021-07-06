import {useElectron} from '/@/use/electron';
import {trackEvent} from '/@/utils/telemetry';


const {openURL} = useElectron();


export function openVK(): Promise<void> {
  trackEvent('Social', 'Click on social link', 'VK');
  return openURL('https://vk.com/playshikionline');
}


export function openTG(): Promise<void> {
  trackEvent('Social', 'Click on social link', 'TG');
  return openURL('https://t.me/playshikionline');
}


export function openGitHub(subpage = ''): Promise<void> {
  trackEvent('Social', 'Click on social link', 'GitHub');

  return openURL('https://github.com/cawa-93/anime-library' + (subpage.startsWith('/') ? subpage : '/' + subpage));
}
