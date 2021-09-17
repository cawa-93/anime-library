import {savePreferredTranslation} from '/@/utils/translationRecommendations/savePreferredTranslation';
import 'fake-indexeddb/auto';
import {getDB} from '/@/utils/translationRecommendations/getDB';
import {getPreferredTranslationAuthorsByType} from '/@/utils/translationRecommendations/getPreferredTranslationAuthorsByType';
import {t} from '/@/utils/translationRecommendations/testsCommon';


describe('getPreferredTranslationAuthorsByType', () => {
  beforeEach(async () => {
    const db = await getDB();
    return db.clear('preferences');
  });

  test('Должен возражать пустой массив если нет авторов', async () => {
    const authors = await getPreferredTranslationAuthorsByType('voice');
    expect(authors).toEqual([]);
  });

  test('Должен возражать пустой массив если нет авторов указанного типа', async () => {
    await savePreferredTranslation(2, t('sub'));

    const authors = await getPreferredTranslationAuthorsByType('voice');
    expect(authors).toEqual([]);
  });

  test('Должен возражать отфильтрованный по типу массив авторов', async () => {
    const subTranslation = t('sub');

    await savePreferredTranslation(1, t('voice'));
    await savePreferredTranslation(2, subTranslation);

    const authors = await getPreferredTranslationAuthorsByType('sub');
    expect(authors).toEqual([subTranslation.author.id]);
  });

  test('Должен возражать массив авторов в правильном порядке', async () => {
    const SERIES_ID = 1;
    const TYPE = 'sub';

    const t1 = t(TYPE);
    const t2 = t(TYPE);
    const t3 = t(TYPE, t1.author);

    await savePreferredTranslation(SERIES_ID, t1);
    await savePreferredTranslation(SERIES_ID, t2);
    await savePreferredTranslation(SERIES_ID +1, t3);

    const authors = await getPreferredTranslationAuthorsByType(TYPE);
    expect(authors).toEqual([t1.author.id, t2.author.id]);
  });
});
