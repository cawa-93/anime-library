import {useElectron} from '/@/use/electron';


const {openURL} = useElectron();
export const openExternalElement = (event: MouseEvent) => {
  if (!event.target) {
    return;
  }

  const target = event.target as HTMLAnchorElement;
  if (!target.href) {
    return;
  }

  openURL(target.href);
};
