import {getDB} from '/@/utils/translationRecommendations/getDB';


export function getPreferredTranslationType(): Promise<'sub' | 'voice'> {
  return Promise.all([
    getDB().then(db => db.countFromIndex('preferences', 'by-type', 'sub')),
    getDB().then(db => db.countFromIndex('preferences', 'by-type', 'voice')),
  ]).then(([subCount, voiceCount]) => subCount > voiceCount ? 'sub' : 'voice');
}
