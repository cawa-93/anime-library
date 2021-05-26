// eslint-disable-next-line @typescript-eslint/no-explicit-any
const requestsCache = new Map<string, Promise<any>>();


/**
 * Не позволяет выполнять последовательно несколько идентичных запросов
 */
export function deDuplicatedRequest<T>(requestId: string, request: () => Promise<T>): Promise<T> {
  let savedRequest = requestsCache.get(requestId);
  if (savedRequest) {
    return savedRequest;
  }
  savedRequest = request().finally(() => requestsCache.delete(requestId));
  requestsCache.set(requestId, savedRequest);
  return savedRequest;
}
