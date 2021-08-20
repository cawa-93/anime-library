import type * as sm from '/@/utils/videoProvider/providers/anime365/anime365-interfaces';
import type {Episode} from '/@/utils/videoProvider';
import type {MalEpisode} from '/@/utils/videoProvider/providers/mal/malEpisode';


export function resolveEpisodesList(targetSeries: Pick<sm.Series, 'episodes' | 'type' | 'numberOfEpisodes'>, malEpisodes: Map<number, MalEpisode>): Episode[] {
  const episodes = targetSeries.episodes;
  if (!episodes || episodes.length === 0) {
    return [];
  }
  /**
   * Некоторые аниме имеют не ккоррекный тип. Например
   * Сериал имеет тип `tv` а ВСЕ серии тип `ona`.
   * Серии чей тип не соответствует типу сериала будут отфильтрованы,
   * поэтому для случаев когда ВСЕ серии не соответствуют типу сериала я предполагаю, что не правильный тип именно у сериала
   * и изменяю его на тип взятый с первой серии
   */
  {
    const firstEpisodeType = episodes[0].episodeType;
    if (episodes.every(e => e.episodeType === firstEpisodeType && e.episodeType !== targetSeries.type)) {
      targetSeries.type = firstEpisodeType;
    }
  }


  return episodes.reduce((accum, episode) => {
    const number = Number.parseFloat(episode.episodeInt);

    // Эпизоды от сервера возвращаются в правильном хронологическом поррядке
    // Это значит что первый элемент массива должен быть с порядковым номером 1
    // Обычно эпизоды предшествующие тому что имеет порядковый номер 1 можно игнорировать
    // они скорее всего загружены не правильно и не имеет переводов
    if (accum.length === 0 && number !== 1) {
      return accum;
    }

    // Игнорировать эпизоды с недействительными порядковыми номерами
    if (number < 1 || !Number.isSafeInteger(number)) {
      return accum;
    }

    // Игнорировать эпизоды с порядковым номером большим чем известное количество эпизодов у аниме
    if (targetSeries.numberOfEpisodes !== 0 && number > targetSeries.numberOfEpisodes) {
      return accum;
    }

    // Игнорировать не активные эпизоды
    if (episode.isActive !== 1) {
      return accum;
    }

    // Игнорировать эпизоды у которых тип не соответствует типу аниме
    // Исключение: Тип аниме tv а тип эпизода = ona
    // Причина в том, что часто аниме с типом ONA публикуют с неверным типом -- TV, а серии в нем имеют правильный тип -- ONA
    // Из-за такого не соответствия отфильтровываются важдые эпизоды
    if (episode.episodeType !== targetSeries.type && !(episode.episodeType === 'ona' && targetSeries.type === 'tv')) {
      return accum;
    }

    const malEpisode = malEpisodes.get(number);
    const title = episode.episodeTitle
      || (
        malEpisode && !/Episode [0-9]+/.test(malEpisode.title)
          ? `${number}. ${malEpisode.title}`
          : episode.episodeFull
      );

    accum.push({
      id: episode.id,
      title,
      number,
      recap: malEpisode?.recap,
      filler: malEpisode?.filler,
    });

    return accum;
  }, [] as Episode[]);
}
