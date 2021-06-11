export interface Anime {
  id: number,
  name: string
  russian?: string
  image: {
    original: string
    preview: string
  },
  status: 'anons' | 'ongoing' | 'released',
  episodes: number
  episodes_aired: number
  score: string
  kind?: 'tv' | 'movie' | 'ova' | 'ona' | 'special',
  url: string
}
