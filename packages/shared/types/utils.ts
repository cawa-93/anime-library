export type Promisified<T> = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  readonly [P in keyof T]: T[P] extends (...a: any[]) => any ? (...a: Parameters<T[P]>) => Promise<ReturnType<T[P]>> : Promise<T[P]>;
}
