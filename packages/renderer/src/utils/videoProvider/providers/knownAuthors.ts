import type {TranslationAuthor} from '/@/utils/videoProvider';


interface knownAuthor {
  regexp?: RegExp | RegExp[]
  author: {
    team: TranslationAuthor['team']
  }
}


/**
 * Массив известных команд и специфичные правила парсинга их названий
 */
export const knownAuthors: knownAuthor[] = [
  {
    regexp: [/Sovet *Romantica/ui, /(?:\P{L}|^)SR(?:\P{L}|$)/u],
    author: {
      team: 'SovetRomantica',
    },
  },

  {
    regexp: [/Shiza *Project/ui, /(?:\P{L}|^)SP(?:\P{L}|$)/u],
    author: {
      team: 'Shiza Project',
    },
  },

  {
    regexp: [/(?:\P{L}|^)waka/ui],
    author: {
      team: 'Wakanim',
    },
  },
  {
    regexp: [/(?:\P{L}|^)Crunch/ui],
    author: {
      team: 'Crunchyroll',
    },
  },
  {
    regexp: [/Animeonline(\.su)?/iu, /(?:\P{L}|^)AOS(?:\P{L}|$)/u],
    author: {
      team: 'Animeonline.su',
    },
  },
  {
    author: {
      team: 'AniDUB',
    },
  },
  {
    author: {
      team: 'AniLibria',
    },
  },
  {
    author: {
      team: 'AniWayt',
    },
  },
  {
    author: {
      team: 'AniStar',
    },
  },
  {
    author: {
      team: 'AnimeVost',
    },
  },
  {
    author: {
      team: 'AniPlay',
    },
  },
  {
    author: {
      team: 'AniMaunt',
    },
  },
  {
    author: {
      team: 'Anifilm',
    },
  },
  {
    author: {
      team: 'Reanimedia',
    },
  },
  {
    author: {
      team: 'AniRai',
    },
  },
  {
    regexp: /AniZone(?:\.tv)?/i,
    author: {
      team: 'AniZone.TV',
    },
  },
  {
    regexp: /Akari *(?:Group)?/i,
    author: {
      team: 'Akari Group',
    },
  },
  {
    regexp: /Sekai *(?:Project)?/i,
    author: {
      team: 'Sekai Project',
    },
  },
  {
    regexp: /Cactus(?: |_)*(?:Team)?/i,
    author: {
      team: 'Cactus Team',
    },
  },
  {
    regexp: /Amazing(?: |_)*Dubbing/i,
    author: {
      team: 'Amazing Dubbing',
    },
  },
];
