import type {DeepReadonly} from 'vue';

export type MaybeReadonly<T> = DeepReadonly<T> | T
