import type {ClearIndex, Fn, NonFunctionKeys} from '../utils';


export type IpcHost<T extends Record<string, Fn>> = Omit<ClearIndex<T>, NonFunctionKeys<ClearIndex<T>>>
