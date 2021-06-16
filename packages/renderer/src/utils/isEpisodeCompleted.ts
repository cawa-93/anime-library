import {MINUTE} from '/@/utils/time';


/**
 * Проверяет можно ли считать эпизод просмотренным
 * @param currentTime Текущая временная метка
 * @param duration Общая длительность эпизода
 */
export function isEpisodeCompleted(currentTime: number, duration: number): boolean {
  const endingTime = duration > MINUTE * 10 ? MINUTE * 3 : duration * 0.2;
  const timeLeft = duration - currentTime;

  return timeLeft <= endingTime;
}
