import {savePreferredTranslation} from '/@/utils/translationRecommendations/savePreferredTranslation';
import 'fake-indexeddb/auto';
import type {Translation} from '/@/utils/videoProvider';
import {getPreferredTranslationType} from '/@/utils/translationRecommendations/getPreferredTranslationType';


describe('getPreferredTranslationType', () => {

  test('Должен возвражать наиболее используемый тип перевода', async () => {
    const translationsToSave: Translation[] = [{
      type: 'voice',
      author: {id: 'id3', team: 'team3', members: []},
      id: 3,
      censored: false,
      qualityType: 'tv',
      title: '',
    }, {
      type: 'voice',
      author: {id: 'id2', team: 'team2', members: []},
      id: 2,
      censored: false,
      qualityType: 'tv',
      title: '',
    }, {
      type: 'sub',
      author: {id: 'id1', team: 'team1', members: []},
      id: 1,
      censored: false,
      qualityType: 'tv',
      title: '',
    }];

    for (let i = 0; i < translationsToSave.length; i++) {
      await savePreferredTranslation(i, translationsToSave[i]);
    }

    const type = await getPreferredTranslationType();

    expect(type).toEqual('voice');
  });
});
