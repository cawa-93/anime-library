import {savePreferredTranslation} from '/@/utils/translationRecommendations/savePreferredTranslation';
import 'fake-indexeddb/auto';
import {getDB} from '/@/utils/translationRecommendations/getDB';
import type {Translation} from '/@/utils/videoProvider';
import type {Ref} from 'vue';
import {reactive, ref} from 'vue';
import {t} from '/@/utils/translationRecommendations/testsCommon';


describe('savePreferredTranslation', () => {

  beforeEach(async () => {
    const db = await getDB();
    return db.clear('preferences');
  });


  describe('Перевод должен сохраняться', () => {
    const SERIES_ID = 1;
    const EXPECTED_TRANSLATION = t('voice');

    afterEach(async () => {
      const db = await getDB();
      return db.clear('preferences');
    });

    const checkSavedWithWrapper = async (wrapper: (v: Translation) => Translation | Ref<Translation>) => {
      const db = await getDB();

      await savePreferredTranslation(SERIES_ID, wrapper(EXPECTED_TRANSLATION));

      const saved = await db.get('preferences', SERIES_ID);
      expect(saved).not.toBeUndefined();
      expect(saved?.type).toEqual(EXPECTED_TRANSLATION.type);
      expect(saved?.author).toEqual([EXPECTED_TRANSLATION.author.id]);
      expect(saved?.seriesId).toEqual(SERIES_ID);
    };

    test('Object', () => checkSavedWithWrapper(v => v));
    test('Ref', () => checkSavedWithWrapper(ref));
    test('Reactive', () => checkSavedWithWrapper(reactive));
  });

  test('Не должен сохранять переводы с недействительным автором', async () => {
    let seriesId = 0;
    // @ts-expect-error Не валидный перевод передаётся умышленно и не должен сохраняться
    await savePreferredTranslation(++seriesId, {});

    // @ts-expect-error Не валидный перевод передаётся умышленно и не должен сохраняться
    await savePreferredTranslation(++seriesId, {type: 'sub', id: 1, title: '', qualityType: 'tv'});

    // @ts-expect-error Не валидный перевод передаётся умышленно и не должен сохраняться
    await savePreferredTranslation(++seriesId, {type: 'sub', id: 1, title: '', qualityType: 'tv', author: {}});

    await savePreferredTranslation(
      ++seriesId,
      {type: 'sub', id: 1, title: '', qualityType: 'tv', censored: false, maxQuality: 720, author: {team: '', id: null, members: []}},
    );

    const db = await getDB();
    const saved = await db.getAll('preferences');

    expect(saved.length).toEqual(0);
  });

  test('Переводы с одинаковым ID не должны дублироваться', async () => {
    const SERIES_ID = 1;
    const EXPECTED_TRANSLATION = t('sub');

    await savePreferredTranslation(SERIES_ID, EXPECTED_TRANSLATION);
    await savePreferredTranslation(SERIES_ID, EXPECTED_TRANSLATION);

    const db = await getDB();
    const saved = await db.get('preferences', SERIES_ID);
    expect(saved?.author.length).toEqual(1);
    expect(saved?.author[0]).toEqual(EXPECTED_TRANSLATION.author.id);
  });

  test('Несколько переводов одного аниме должны объединяться', async () => {
    const SERIES_ID = 1;
    const translationsToSave = [
      t('sub'),
      t('sub'),
    ];

    const EXPECTED_SAVED_AUTHORS = translationsToSave.map(t => t.author.id).reverse();

    for (const translation of translationsToSave) {
      await savePreferredTranslation(SERIES_ID, translation);
    }

    const db = await getDB();
    const saved = await db.get('preferences', SERIES_ID);
    expect(saved?.author).toEqual(EXPECTED_SAVED_AUTHORS);
  });

  test('Изменение типа перевода должно обнулить массив авторов', async () => {
    const SERIES_ID = 1;
    const voiceTranslationsToSave = [
      t('voice'),
      t('voice'),
    ];

    for (const translation of voiceTranslationsToSave) {
      await savePreferredTranslation(SERIES_ID, translation);
    }

    const subTranslation = t('sub');

    await savePreferredTranslation(
      SERIES_ID,
      subTranslation,
    );

    const db = await getDB();
    const saved = await db.get('preferences', SERIES_ID);
    expect(saved?.author).toEqual([subTranslation.author.id]);
  });
});
