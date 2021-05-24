import type {MaybeReadonly} from '/@shared/types/utils';


export function formatList(list: MaybeReadonly<string[]>): string {

  // @ts-expect-error ListFormat experimental
  return new Intl.ListFormat('ru-RU', { style: 'long', type: 'conjunction' }).format(list);
}
