import type {TranslationAuthor} from '/@/utils/videoProvider';
import type {MaybeReadonly} from '/@shared/types/utils';


const qualitiesRegexps = [/tv/, /bd/, /hd/, /sd/, /dvd/, /blu-?ray/, /(?:720|1080)[pр]?/];
const stopWords = [/by/, /feat/, /studio/, /студия/, /voice/, /sub/, /телеканал/, /chan+el/, /group/, /project/];

const FALLBACK_AUTHOR: TranslationAuthor = {
  id: null,
  team: 'Неизвестный',
  members: [],
};


export function isAuthorsEqual(a1: MaybeReadonly<TranslationAuthor>, a2: MaybeReadonly<TranslationAuthor>): boolean {
  return a1.id !== null && a1.id === a2.id;
}


function getIdFromString(str: string): string | null {
  let id = str
    .toLocaleLowerCase();

  for (const r of [...qualitiesRegexps, ...stopWords]) {
    id = id.replace(r, '');
  }

  id = id
    .replace(/\W|[0-9]+/g, '')
    .trim();

  return id === '' ? null : id;
}



function parseAuthor(summary: string): TranslationAuthor {
  if (!summary || !summary.trim()) {
    return FALLBACK_AUTHOR;
  }

  const list = summary.split(/[()[\]|&,]/);

  const [team, ...members] = list
    .flatMap(s => s.split(/[()[\]|&,]/))
    .filter(s => {

      let tempStr = s.trim().toLocaleLowerCase();

      if (!tempStr) {
        return false;
      }

      for (const qualitiesRegexp of qualitiesRegexps) {
        tempStr = tempStr.replace(qualitiesRegexp, '').trim();
        if (!tempStr) {
          return false;
        }
      }

      return true;
    })
    .map(s => s.trim());

  if (team) {
    // TODO: Добавить трекинг.
    //  Чтобы можно было отслеживать какие команды встречаются часто и заносить их в список известных авторов
    return {
      id: getIdFromString(team),
      team,
      members,
    };
  } else {
    console.warn(`Не удалось определить автора: '${summary}'`);
    return FALLBACK_AUTHOR;
  }
}


// eslint-disable-next-line @typescript-eslint/no-unused-vars
function findAuthor(summary: string): TranslationAuthor | undefined {
  // TODO: Добавить список известных команд
  return undefined;
}


export function getAuthor(author: { summary?: string }): TranslationAuthor {
  return author?.summary ? (findAuthor(author.summary) || parseAuthor(author.summary)) : FALLBACK_AUTHOR;
}
