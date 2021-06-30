/**
 * Заставляет Object.keys() возвращать не `string[]` а более узкий тип по ключам объекта
 *
 * @example
 * ```js
 * const obj = {foo:1, bar:2};
 * const arr = Object.keys(obj)
 * typeof arr // ("foo" | "bar")[]
 * ```
 */

type ObjectKeys<T> =
// eslint-disable-next-line @typescript-eslint/no-explicit-any
  T extends Record<any, any> ? (keyof T)[] :
    T extends number ? [] :
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      T extends Array<any> | string ? string[] :
        never;

interface ObjectConstructor {
  keys<T>(o: T): ObjectKeys<T>
}
