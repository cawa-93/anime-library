const API_BASE = 'https://smotret-anime.online/api';

export interface Series {
  id: number
  title: string
}


export function getSeries(id: string | number): Promise<Series> {
  return fetch(`${API_BASE}/series/?myAnimeListId=${id}`)
    .then(r => r.json())
    .then(r => ({
      id: Number.parseInt(r.data[0].id),
      title: r.data[0].titles.ru as string,
    }));
}


export interface Episode {
  id: number
  title: string
}

export function getEpisodes(id: string | number): Promise<Episode[]> {
  return fetch(`${API_BASE}/series/?myAnimeListId=${id}&fields=episodes`)
    .then(r => r.json())
    .then(({data}: { data: any[] }) => {
      return data[0].episodes.map((e: any) => ({id: e.id, title: e.episodeTitle || e.episodeFull}));
    });
}


export interface Translation {
  id: number
  title: string
}

export function getTranslations(id: string | number): Promise<Translation[]> {
  return fetch(`${API_BASE}/episodes/${id}`)
    .then(r => r.json())
    .then(({data}: { data: { translations: any[] } }) => {
      return data.translations.map((e: any) => ({id: e.id, title: e.authorsSummary}));
    });
}


export interface Video {
  height: number
  url: string
}

// https://smotret-anime.online/api/translations/embed/2423373
export function getVideos(id: string | number): Promise<Video[]> {
  return fetch(`${API_BASE}/translations/embed/${id}?&access_token=${import.meta.env.VITE_SM_ACCESS_TOKEN}`)
    .then(r => r.json())
    .then(({data}: { data: any }) => {
      return data.stream.map((e: any) => ({height: e.height, url: e.urls[0]}));
    });
}
