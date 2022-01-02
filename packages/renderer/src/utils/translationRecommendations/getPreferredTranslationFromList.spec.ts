import {getDB} from '/@/utils/translationRecommendations/getDB';
import {getPreferredTranslationFromList} from '/@/utils/translationRecommendations/getPreferredTranslationFromList';
import 'fake-indexeddb/auto';
import {savePreferredTranslation} from '/@/utils/translationRecommendations/savePreferredTranslation';
import {a, t} from '/@/utils/translationRecommendations/testsCommon';
import {describe, test, expect, beforeEach} from 'vitest';


describe('getPreferredTranslationFromList', () => {

  beforeEach(async () => {
    const db = await getDB();
    return db.clear('preferences');
  });

  test('Должен возвращать undefined', async () => {
    expect(await getPreferredTranslationFromList(0, [])).toBeUndefined();
    expect(await getPreferredTranslationFromList(0, undefined)).toBeUndefined();
    expect(await getPreferredTranslationFromList(0, null)).toBeUndefined();
  });


  test('Если нет сохранённых предпочтений', async () => {
    const SERIES_ID = 1;
    const availableTranslations = [
      t('voice'),
      t('voice'),
    ];

    const preferred = await getPreferredTranslationFromList(SERIES_ID, availableTranslations);
    expect(preferred).toEqual(availableTranslations[0]);
  });

  test('Должен возвращать первый из доступных переводов если не сохранено переводов предпочитаемого типа', async () => {
    const SERIES_ID = 1;
    const availableTranslations = [
      t('voice'),
      t('voice'),
    ];

    await savePreferredTranslation(SERIES_ID, t('sub'));

    const preferred = await getPreferredTranslationFromList(SERIES_ID, availableTranslations);
    expect(preferred).toEqual(availableTranslations[0]);
  });

  test('Должен возвращать первый подходящий по типу перевод, если ничего не соответствует предпочтениям', async () => {
    const SERIES_ID = 1;

    const EXPECTED_TRANSLATION = t('voice');

    const availableTranslations = [
      t('sub'),
      t('sub'),
      EXPECTED_TRANSLATION,
      t('sub'),
      t('voice'),
    ];


    await savePreferredTranslation(SERIES_ID + 1, t('voice'));

    const preferred = await getPreferredTranslationFromList(SERIES_ID, availableTranslations);
    expect(preferred).toEqual(EXPECTED_TRANSLATION);
  });

  test('Должен возвращать перевод предпочитаемого типа', async () => {
    await savePreferredTranslation(1, t('voice'));
    await savePreferredTranslation(2, t('voice'));
    await savePreferredTranslation(3, t('sub'));

    const availableTranslations = [
      t('sub'),
      t('voice'),
      t('sub'),
    ];

    const preferred = await getPreferredTranslationFromList(0, availableTranslations);
    expect(preferred?.type).toEqual('voice');
  });

  test('Должен возвращать перевод предпочитаемого автора с правильным типом', async () => {
    const SERIES_ID = 1;
    const team1 = a();

    await savePreferredTranslation(SERIES_ID + 1, t('sub', team1));
    await savePreferredTranslation(SERIES_ID + 2, t('sub'));
    await savePreferredTranslation(SERIES_ID + 3, t('sub', team1));
    await savePreferredTranslation(SERIES_ID + 4, t('sub', team1));

    const preferred = await getPreferredTranslationFromList(SERIES_ID, [
      t('voice'),
      t('voice', team1),
      t('sub'),
      t('sub', team1),
    ]);

    expect(preferred?.author).toEqual(team1);
    expect(preferred?.type).toEqual('sub');
  });

  test('Должен возвращать перевод предпочитаемого автора если у аниме несколько авторов', async () => {
    const SERIES_ID = 0;
    const translationsToSave = [
      t('sub'),
      t('sub'),
      t('sub'),
    ];

    for (const translation of translationsToSave) {
      await savePreferredTranslation(SERIES_ID, translation);
    }

    const EXPECTED_AUTHOR = translationsToSave[translationsToSave.length - 1].author;
    const EXPECTED_TRANSLATION = t('sub', EXPECTED_AUTHOR);

    const availableTranslations = [
      t('sub'),
      t('sub', translationsToSave[translationsToSave.length - 2].author),
      EXPECTED_TRANSLATION,
      t('sub'),
    ];

    const preferred = await getPreferredTranslationFromList(SERIES_ID, availableTranslations);
    expect(preferred).toEqual(EXPECTED_TRANSLATION);
  });

});
