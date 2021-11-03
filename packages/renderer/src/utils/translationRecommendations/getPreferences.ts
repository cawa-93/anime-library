import {getDB} from '/@/utils/translationRecommendations/getDB';


export async function getPreferences() {
  const db = await getDB();
  return db.getAll('preferences');
}
