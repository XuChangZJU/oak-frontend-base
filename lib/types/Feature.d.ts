import { Aspect } from 'oak-domain/lib/types/Aspect';
import { EntityDict } from 'oak-domain/lib/types/Entity';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-domain/EntityDict';
import { aspectDict as basicAspectDict } from 'oak-general-business';
import { FrontContext } from '../FrontContext';
import { AspectProxy } from './AspectProxy';
export declare abstract class Feature<ED extends EntityDict & BaseEntityDict, AD extends Record<string, Aspect<ED>>> {
    private aspectProxy?;
    private context?;
    protected getAspectProxy(): NonNullable<AspectProxy<ED, AD & {
        loginByPassword: typeof import("oak-general-business/src/aspects/token").loginByPassword;
        loginMp: typeof import("oak-general-business/src/aspects/token").loginMp;
        operate: typeof import("oak-general-business/src/aspects/crud").operate;
        select: typeof import("oak-general-business/src/aspects/crud").select;
    }>>;
    setAspectProxy(aspectProxy: AspectProxy<ED, AD & typeof basicAspectDict>): void;
    protected getContext(): FrontContext<ED>;
    setFrontContext(context: FrontContext<ED>): void;
}
