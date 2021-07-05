import type {TranslationAuthor} from '/@/utils/videoProvider';
import type {MaybeReadonly} from '/@shared/types/utils';
import {knownAuthors} from '/@/utils/videoProvider/providers/knownAuthors';


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


function rus_to_latin(str: string) {

  const ru = new Map([
    ['а', 'a'], ['б', 'b'], ['в', 'v'], ['г', 'g'], ['д', 'd'], ['е', 'e'],
    ['є', 'e'], ['ё', 'e'], ['ж', 'j'], ['з', 'z'], ['и', 'i'], ['ї', 'yi'], ['й', 'i'],
    ['к', 'k'], ['л', 'l'], ['м', 'm'], ['н', 'n'], ['о', 'o'], ['п', 'p'], ['р', 'r'],
    ['с', 's'], ['т', 't'], ['у', 'u'], ['ф', 'f'], ['х', 'h'], ['ц', 'c'], ['ч', 'ch'],
    ['ш', 'sh'], ['щ', 'shch'], ['ы', 'y'], ['э', 'e'], ['ю', 'u'], ['я', 'ya'],
  ]);

  str = str.replace(/[ъь]+/g, '');

  return Array.from(str)
    .reduce((s, l) => {
        let letter = ru.get(l);

        if (letter) {
          return s + letter;
        }

        letter = ru.get(l.toLowerCase());
        if (letter) {
          return s + letter.toUpperCase();
        }

        return s + l;
      }
      , '');
}


function getIdFromString(str: string): string | null {
  let id = rus_to_latin(str.toLocaleLowerCase().trim());

  for (const r of [...qualitiesRegexps, ...stopWords]) {
    id = id.replace(r, '');
  }

  // Замена некоторых

  id = id
    .replace(/[^\p{L}]|[0-9]+/ug, '')
    .trim();

  return id === '' ? null : id;
}



function parseAuthor(summary: string): TranslationAuthor {
  if (!summary || !summary.trim()) {
    return FALLBACK_AUTHOR;
  }

  const list = summary.split(/[()[\]|&,]/);

  const authorChunks = list
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

  let baseAuthor: { team: string, members?: string[] } | undefined;
  for (const authorChunk of authorChunks) {
    baseAuthor = find(authorChunk);

    if (!baseAuthor) {
      baseAuthor = find(rus_to_latin(authorChunk));
    }

    if (baseAuthor) {
      baseAuthor.members = authorChunks.filter(c => c !== authorChunk);
      break;
    }
  }

  if (!baseAuthor && authorChunks.length > 0) {
    baseAuthor = {
      team: authorChunks[0],
      members: authorChunks.slice(1),
    };
  }

  if (baseAuthor) {
    // TODO: Добавить трекинг.
    //  Чтобы можно было отслеживать какие команды встречаются часто и заносить их в список известных авторов
    return {
      id: getIdFromString(baseAuthor.team),
      team: baseAuthor.team,
      members: baseAuthor.members || [],
    };
  } else {
    if (import.meta.env.MODE === 'development') {
      console.warn(`Не удалось определить автора: '${summary}'`);
    }
    return FALLBACK_AUTHOR;
  }
}


function find(str: string) {
  for (const {author, regexp} of knownAuthors) {
    if (author.team.toLocaleLowerCase().trim() === str.toLocaleLowerCase()) {
      return author;
    }

    if (!regexp) {
      continue;
    }

    const regArr = Array.isArray(regexp) ? regexp : [regexp];

    if (regArr.some(r => r.test(str))) {
      return author;
    }
  }
}

export function getAuthor(author: { summary?: string }): TranslationAuthor {
  return author?.summary ? parseAuthor(author.summary) : FALLBACK_AUTHOR;
}
