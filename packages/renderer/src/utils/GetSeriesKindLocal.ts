/**
 * Возвращает локализированное название типа аниме
 * @param kind
 */
export function getSeriesKindLocal(kind: SeriesKind): string {
  switch (kind) {
    case 'tv': return 'TV Сериал';
    case 'movie': return 'Фильм';
    case 'special': return 'Спешл';
    case 'music': return 'Клип';
    default: return kind.toUpperCase();
  }
}
