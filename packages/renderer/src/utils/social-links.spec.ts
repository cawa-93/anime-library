import * as links from './social-links';

describe('Ссылки на соц. сети не должны заканчиваться на /', () => {
  for (const [,link] of Object.entries(links)) {
    test(link, () => expect(link.endsWith('/')).toBeFalsy());
  }
});
