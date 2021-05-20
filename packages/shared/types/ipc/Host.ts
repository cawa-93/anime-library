import type {ClearIndex, Fn, NonFunctionKeys} from '../utils';


export type HostBase = Record<string, Fn>
export type MethodOnlyHost<T extends HostBase> = Omit<ClearIndex<T>, NonFunctionKeys<ClearIndex<T>>>
