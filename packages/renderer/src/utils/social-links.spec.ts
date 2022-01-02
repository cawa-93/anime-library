import * as links from './social-links';
import {describe, test, expect} from 'vitest';

describe('Ссылки на соц. сети не должны заканчиваться на /', () => {
  for (const [,link] of Object.entries(links)) {
    test.concurrent(link, () => expect(link.endsWith('/')).toBeFalsy());
  }
});
