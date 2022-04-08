import { Aspect } from 'oak-general-business/lib/types/Aspect';
import { EntityDict } from 'oak-domain/lib/types/Entity';
import { aspectDict as basicAspectDict } from 'oak-general-business';
import { FrontContext } from '../FrontContext';
import { AspectProxy } from './AspectProxy';
export declare abstract class Feature<ED extends EntityDict, AD extends Record<string, Aspect<ED>>> {
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
    setContext(context: FrontContext<ED>): void;
}
export declare function subscribe(callback: () => void): () => void;
/**
 * 方法注解，使函数调用最后一层堆栈时唤起所有登记的回调
 * @param target
 * @param propertyName
 * @param descriptor
 */
export declare function Action(target: any, propertyName: string, descriptor: TypedPropertyDescriptor<any>): void;
