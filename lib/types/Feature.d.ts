import { Aspect } from 'oak-domain/lib/types/Aspect';
import { EntityDict } from 'oak-domain/lib/types/Entity';
import { aspectDict as basicAspectDict } from 'oak-general-business';
import { FrontContext } from '../FrontContext';
import { AspectProxy } from './AspectProxy';
declare type Action = {
    type: string;
    payload?: object;
};
export declare abstract class Feature<ED extends EntityDict, AD extends Record<string, Aspect<ED>>> {
    private aspectProxy?;
    abstract get(context: FrontContext<ED>, params: any): any;
    abstract action(context: FrontContext<ED>, action: Action): any;
    protected getAspectProxy(): NonNullable<AspectProxy<ED, AD & {
        loginByPassword: typeof import("oak-general-business/src/aspects/token").loginByPassword;
        loginMp: typeof import("oak-general-business/src/aspects/token").loginMp;
        operate: typeof import("oak-general-business/src/aspects/crud").operate;
        select: typeof import("oak-general-business/src/aspects/crud").select;
    }>>;
    setAspectProxy(aspectProxy: AspectProxy<ED, AD & typeof basicAspectDict>): void;
}
export {};
