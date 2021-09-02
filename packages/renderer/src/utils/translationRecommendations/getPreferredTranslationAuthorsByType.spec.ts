import {savePreferredTranslation} from '/@/utils/translationRecommendations/savePreferredTranslation';
import 'fake-indexeddb/auto';
import {getDB} from '/@/utils/translationRecommendations/getDB';
import type {Translation} from '/@/utils/videoProvider';
import {getPreferredTranslationAuthorsByType} from '/@/utils/translationRecommendations/getPreferredTranslationAuthorsByType';


describe('getPreferredTranslationAuthorsByType', () => {

  const team1 = {id: 'team1', team: 'team1', members: []};
  const team2 = {id: 'team2', team: 'team2', members: []};

  const t = (type: Translation['type'], author: Translation['author'], seriesId: number): (Translation & { seriesId: number }) => ({
    type,
    author,
    seriesId,
    id: 1,
    censored: false,
    qualityType: 'tv',
    title: '',
  });


  beforeEach(async () => {
    const db = await getDB();
    return db.clear('preferences');
  });

  test('Должен возвражать пустой массив если нет авторов', async () => {
    const authors = await getPreferredTranslationAuthorsByType('voice');
    expect(authors).toEqual([]);
  });

  test('Должен возвражать пустой массив если нет авторов указанного типа', async () => {
    await savePreferredTranslation(2, t('sub', team1, 2));

    const authors = await getPreferredTranslationAuthorsByType('voice');
    expect(authors).toEqual([]);
  });

  test('Должен возвражать отфильтрованный по типу массив авторов', async () => {
    await savePreferredTranslation(1, t('voice', team1, 1));
    await savePreferredTranslation(2, t('sub', team1, 2));

    const authors = await getPreferredTranslationAuthorsByType('voice');
    expect(authors).toEqual([team1.id]);
  });

  test('Должен возвражать массив авторов в правильном порядке', async () => {
    const TYPE = 'sub';
    await savePreferredTranslation(1, t(TYPE, team1, 1));
    await savePreferredTranslation(1, t(TYPE, team2, 1));
    await savePreferredTranslation(2, t(TYPE, team2, 2));

    const authors = await getPreferredTranslationAuthorsByType(TYPE);
    expect(authors).toEqual([team2.id, team1.id]);
  });
});
