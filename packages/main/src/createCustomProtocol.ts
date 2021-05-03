import type {Protocol} from 'electron';
import {protocol} from 'electron';
import {URL} from 'url';
import {join} from 'path';

export function createProtocol(scheme: string, customProtocol: Protocol = protocol): void {
  customProtocol.registerFileProtocol(
    scheme,
    (request, respond) => {
      let pathName = new URL(request.url).pathname;
      pathName = decodeURI(pathName); // Needed in case URL contains spaces

      const isRouteRequest = pathName.endsWith('/');
      const resolvedPath = join(__dirname, '../../renderer/dist', isRouteRequest ? '../../renderer/dist/index.html' : pathName);

      respond(resolvedPath);
    },
  );
}


