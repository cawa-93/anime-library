import {savePreferredTranslation} from '/@/utils/translationRecommendations/savePreferredTranslation';
import 'fake-indexeddb/auto';
import {getDB} from '/@/utils/translationRecommendations/getDB';
import type {Translation} from '/@/utils/videoProvider';


describe('savePreferredTranslation', () => {

  beforeEach(async () => {
    const db = await getDB();
    return db.clear('preferences');
  });

  test('Перевод должен сохраняться', async () => {

    const seriesId = 1;

    const translationToSave: Translation = {
      type: 'voice',
      author: {id: 'id1', team: 'team1', members: []},
      id: 1,
      censored: false,
      qualityType: 'tv',
      title: '',
    };

    await savePreferredTranslation(seriesId, translationToSave);

    const db = await getDB();
    const saved = await db.get('preferences', seriesId);
    expect(saved).not.toBeUndefined();
    expect(saved?.type).toEqual(translationToSave.type);
    expect(saved?.author).toEqual([translationToSave.author.id]);
    expect(saved?.seriesId).toEqual(seriesId);
  });

  test('Переводы с одинаковым ID не должны дублироваться', async () => {

    const seriesId = 1;

    const translationToSave: Translation = {
      type: 'voice',
      author: {id: 'id1', team: 'team1', members: []},
      id: 1,
      censored: false,
      qualityType: 'tv',
      title: '',
    };

    await savePreferredTranslation(seriesId, translationToSave);
    await savePreferredTranslation(seriesId, translationToSave);

    const db = await getDB();
    const saved = await db.get('preferences', seriesId);
    expect(saved?.author).toEqual([translationToSave.author.id]);
  });

  test('Несколько переводов одного аниме должны объединяться', async () => {

    const seriesId = 1;

    const translationsToSave: Translation[] = [{
      type: 'voice',
      author: {id: 'id3', team: 'team3', members: []},
      id: 3,
      censored: false,
      qualityType: 'tv',
      title: '',
    },{
      type: 'voice',
      author: {id: 'id2', team: 'team2', members: []},
      id: 2,
      censored: false,
      qualityType: 'tv',
      title: '',
    }];

    await savePreferredTranslation(seriesId, translationsToSave[0]);
    await savePreferredTranslation(seriesId, translationsToSave[1]);

    const db = await getDB();
    const saved = await db.get('preferences', seriesId);
    expect(saved?.author).toEqual([translationsToSave[1].author.id, translationsToSave[0].author.id]);
  });
});
