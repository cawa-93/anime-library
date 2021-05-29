export function getSeriesId(str: string): number | undefined {
  const id = /\/animes?\/[a-z]*(?<animeID>[0-9]+)/.exec(str)?.groups?.animeID;

  if (!id) {
    return;
  }
  const numId = Number.parseInt(id, 10);
  return Number.isNaN(numId) ? undefined : numId;
}
