import {savePreferredTranslation} from '/@/utils/translationRecommendations/savePreferredTranslation';
import 'fake-indexeddb/auto';
import {getPreferredTranslationType} from '/@/utils/translationRecommendations/getPreferredTranslationType';
import {t} from '/@/utils/translationRecommendations/testsCommon';
import {describe, test, expect} from 'vitest';


describe('getPreferredTranslationType', () => {

  test('Должен возвращать наиболее используемый тип перевода', async () => {
    const translationsToSave = [
      t('sub'),
      t('voice'),
      t('voice'),
      t('sub'),
      t('voice'),
    ];

    for (let i = 0; i < translationsToSave.length; i++) {
      await savePreferredTranslation(i, translationsToSave[i]);
    }

    const type = await getPreferredTranslationType();

    expect(type).toEqual('voice');
  });
});
