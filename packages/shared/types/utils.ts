import type {DeepReadonly} from 'vue';


export type Promisified<T> = {
  readonly [P in keyof T]: T[P] extends Fn ? (...a: Parameters<T[P]>) => Promise<ReturnType<T[P]>> : Promise<T[P]>;
}

/**
 * NonUndefined
 * @see https://github.com/piotrwitek/utility-types#nonundefineda
 * @desc Exclude undefined from set `A`
 * @example
 *   // Expect: "string | null"
 *   SymmetricDifference<string | null | undefined>;
 */
export type NonUndefined<A> = A extends undefined ? never : A;


/**
 * FunctionKeys
 * @see https://github.com/piotrwitek/utility-types#functionkeyst
 * @desc Get union type of keys that are functions in object type `T`
 * @example
 *  type MixedProps = {name: string; setName: (name: string) => void; someKeys?: string; someFn?: (...args: any) => any;};
 *
 *   // Expect: "setName | someFn"
 *   type Keys = FunctionKeys<MixedProps>;
 */
export declare type FunctionKeys<T extends Record<string, unknown>> = {
  [K in keyof T]-?: NonUndefined<T[K]> extends Fn ? K : never;
}[keyof T];



/**
 * NonFunctionKeys
 * @see https://github.com/piotrwitek/utility-types#nonfunctionkeyst
 * @desc Get union type of keys that are non-functions in object type `T`
 * @example
 *   type MixedProps = {name: string; setName: (name: string) => void; someKeys?: string; someFn?: (...args: any) => any;};
 *
 *   // Expect: "name | someKey"
 *   type Keys = NonFunctionKeys<MixedProps>;
 */
export declare type NonFunctionKeys<T extends Record<string, unknown>> = {
  [K in keyof T]-?: NonUndefined<T[K]> extends Fn ? never : K;
}[keyof T];



// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Fn = (...args: any[]) => any



export type ClearIndex<T> = {
  [P in keyof T as string extends P ? never : number extends P ? never : P]: T[P]
};



export type MaybeReadonly<T> = DeepReadonly<T> | T
