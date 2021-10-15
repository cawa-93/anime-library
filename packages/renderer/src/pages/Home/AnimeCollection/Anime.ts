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
  kind?: SeriesKind,
  url: string
  aired_on?: string
}
