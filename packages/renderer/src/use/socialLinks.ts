import {useElectron} from '/@/use/electron';
import {trackEvent} from '/@/utils/telemetry';


const {openURL} = useElectron();


export function openVK(mustOpenChat = false): Promise<void> {
  trackEvent('Social', 'Click on social link', 'VK');
  return openURL(mustOpenChat
    ? 'https://vk.com/im?sel=-185683833'
    : 'https://vk.com/playshikionline',
  );
}


export function openTG(mustOpenChat = false): Promise<void> {
  trackEvent('Social', 'Click on social link', 'TG');
  return openURL(mustOpenChat
    ? 'https://t.me/playshikionline_chat'
    : 'https://t.me/playshikionline',
  );
}


export function openGitHub(subpage = ''): Promise<void> {
  trackEvent('Social', 'Click on social link', 'GitHub');

  return openURL('https://github.com/cawa-93/anime-library' + (subpage.startsWith('/') ? subpage : '/' + subpage));
}
