import type {Translation} from '/@/utils/videoProvider';
import {getDB} from '/@/utils/translationRecommendations/getDB';
import {getPreferredTranslationFromList} from '/@/utils/translationRecommendations/getPreferredTranslationFromList';
import 'fake-indexeddb/auto';
import {savePreferredTranslation} from '/@/utils/translationRecommendations/savePreferredTranslation';


describe('getPreferredTranslationFromList', () => {

  const team1 = {id: 'team1', team: 'team1', members: []};
  const team2 = {id: 'team2', team: 'team2', members: []};

  const t = (type: Translation['type'], author: Translation['author']): Translation => ({
    type,
    author,
    id: 1,
    censored: false,
    qualityType: 'tv',
    title: '',
  });


  beforeEach(async () => {
    const db = await getDB();
    return db.clear('preferences');
  });

  test('Должен возвращать undefined', async () => {
    expect(await getPreferredTranslationFromList(0, [])).toBeUndefined();
    expect(await getPreferredTranslationFromList(0, undefined)).toBeUndefined();
    expect(await getPreferredTranslationFromList(0, null)).toBeUndefined();
  });

  test('Должен возвращать первый перевод если нет предпочтений', async () => {
    const SERIES_ID = 1;
    const t1 = t('voice', team1);
    const t2 = t('voice', team2);

    const preferred = await getPreferredTranslationFromList(SERIES_ID, [t1, t2]);
    expect(preferred).toEqual(t1);
  });

  test('Должен возвращать выбранный перевод для выбранного аниме', async () => {
    const SELECTED_SERIES_ID = 0;
    await savePreferredTranslation(1, t('voice', team1));
    await savePreferredTranslation(2, t('voice', team2));
    await savePreferredTranslation(SELECTED_SERIES_ID, t('sub', team1));

    const SELECTED_AUTHOR = {id: 'n2', team: 't2', members: []};

    const availableTranslations = [
      t('voice', {id: 'n1', team: 't1', members: []}),
      t('sub', SELECTED_AUTHOR),
    ];

    const preferred = await getPreferredTranslationFromList(SELECTED_SERIES_ID, availableTranslations);
    expect(preferred?.type).toEqual('sub');
    expect(preferred?.author).toEqual(SELECTED_AUTHOR);
  });

  test('Должен возвращать перевод предпочитаемого типа', async () => {
    await savePreferredTranslation(1, t('voice', team1));
    await savePreferredTranslation(2, t('voice', team2));
    await savePreferredTranslation(3, t('sub', team1));

    const availableTranslations = [
      t('voice', {id: 'n1', team: 't1', members: []}),
      t('sub', {id: 'n2', team: 't2', members: []}),
    ];

    const preferred = await getPreferredTranslationFromList(0, availableTranslations);
    expect(preferred?.type).toEqual('voice');
  });

  test('Должен возвращать перевод предпочитаемого автора', async () => {
    await savePreferredTranslation(1, t('sub', team1));
    await savePreferredTranslation(2, t('sub', team2));
    await savePreferredTranslation(3, t('sub', team1));

    const SELECTED_TRANSLATION =  t('sub', team1);

    const availableTranslations = [
      t('sub', team1),
      SELECTED_TRANSLATION,
      t('sub', team2),
    ];

    const preferred = await getPreferredTranslationFromList(0, availableTranslations);
    expect(preferred).toEqual(SELECTED_TRANSLATION);
  });

  test('Должен возвращать перевод предпочитаемого автора если у аниме несколько авторов', async () => {
    const SERIES_ID = 0;
    await savePreferredTranslation(SERIES_ID, t('sub', team1));

    // Перевеод с team2 был добавлен последним, значит у него выше приоритет
    await savePreferredTranslation(SERIES_ID, t('sub', team2));

    const SELECTED_TRANSLATION = t('sub', team2);

    const availableTranslations = [
      t('sub', team1),
      SELECTED_TRANSLATION,
    ];

    const preferred = await getPreferredTranslationFromList(SERIES_ID, availableTranslations);
    expect(preferred).toEqual(SELECTED_TRANSLATION);
  });

});
