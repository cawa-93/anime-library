import type {Translation, TranslationAuthor, TranslationType} from '/@/utils/videoProvider';
import {randomUUID} from 'crypto';

let tId = 0;

/**
 * Создаёт объект перевода с указанным типом и автором
 * @param type
 * @param author
 */
export const t = (type: TranslationType, author: TranslationAuthor = a()): Translation => ({
  id: ++tId,
  censored: false,
  qualityType: 'tv',
  title: '',
  type,
  author,
});


/**
 * Создаёт объект автора с указанным ID
 * @param id
 */
export const a = (id: string = randomUUID()): TranslationAuthor => ({
  id,
  team: id,
  members: [],
});
