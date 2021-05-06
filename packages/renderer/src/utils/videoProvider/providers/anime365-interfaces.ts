export interface ApiResponseSuccess<T> {
  data: T
}

export interface ApiResponseFailure {
  error: {
    code: number
    message: string
  }
}

export type ApiResponse<T> = ApiResponseSuccess<T> | ApiResponseFailure

export interface Link {
  title: string;
  url: string;
}

export interface Titles {
  romaji?: string;
  ru?: string;
  ja?: string;
  en?: string;
}

export interface Description {
  source: string;
  value: string;
  updatedDateTime: string;
}

export interface Episode {
  id: number;
  episodeFull: string;
  episodeInt: string;
  episodeTitle?: string;
  episodeType: string;
  firstUploadedDateTime: string;
  isActive: 1 | 0;
  isFirstUploaded: 1 | 0;
  seriesId: number;
  translations?: (TranslationVoice | TranslationSub | TranslationRaw)[]
}

export interface Genre {
  id: number;
  title: string;
  url: string;
}

export interface Series {
  id: number;
  aniDbId: number;
  animeNewsNetworkId: number;
  fansubsId: number;
  imdbId: number;
  worldArtId: number;
  isActive: 1 | 0;
  isAiring: 1 | 0;
  isHentai: 1 | 0;
  links: Link[];
  myAnimeListId: number;
  myAnimeListScore: string;
  worldArtScore: string;
  worldArtTopPlace?: number;
  numberOfEpisodes: number;
  season: string;
  year: number;
  type: string;
  typeTitle: string;
  titles: Titles;
  posterUrl: string;
  posterUrlSmall: string;
  titleLines: string[];
  allTitles: string[];
  title: string;
  url: string;
  descriptions: Description[];
  episodes?: Episode[];
  genres: Genre[];
}


export interface TranslationVoice extends Translation {
  typeKind: 'voice'
  typeLang: 'rus'
}

export interface TranslationSub extends Translation {
  typeKind: 'sub'
  typeLang: 'rus'
}


export interface TranslationRaw extends Translation {
  typeKind: 'raw'
  typeLang: 'ja'
}

export interface Translation {
  id: number;
  addedDateTime: string;
  activeDateTime: string;
  authorsList: string[];
  fansubsTranslationId: number;
  isActive: 1 | 0;
  priority: number;
  qualityType: 'bd' | 'uncensored' | 'dvd' | 'tv';
  type: string;
  typeKind: string;
  typeLang: string;
  updatedDateTime: string;
  title: string;
  seriesId: number;
  episodeId: number;
  url: string;
  embedUrl: string;
  authorsSummary?: string;
  episode?: Episode;
  series?: Series;
  duration: string;
  width: number;
  height: number;
}


export interface Download {
  height: number;
  url: string;
}

export interface Stream {
  height: number;
  urls: string[];
}

export interface Video {
  embedUrl: string;
  download: Download[];
  stream: Stream[];
  subtitlesUrl?: string;
}
