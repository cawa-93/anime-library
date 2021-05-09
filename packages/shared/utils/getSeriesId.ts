export function getSeriesId(str: string): `${number}` | undefined {
  return /\/animes\/[a-z]*(?<animeID>[0-9]+)/.exec(str)?.groups?.animeID as `${number}`;
}
