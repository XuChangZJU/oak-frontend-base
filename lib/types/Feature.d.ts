import { EntityDict, Aspect, AspectProxy, Context } from 'oak-domain/lib/types';
import baseAspectDict from 'oak-common-aspect';
export declare abstract class Feature<ED extends EntityDict, Cxt extends Context<ED>, AD extends Record<string, Aspect<ED, Cxt>>> {
    private aspectProxy?;
    protected getAspectProxy(): NonNullable<AspectProxy<ED, Cxt, AD & {
        operate: typeof import("oak-common-aspect/src/crud").operate;
        select: typeof import("oak-common-aspect/src/crud").select;
        amap: typeof import("oak-common-aspect/src/amap").amap;
        getTranslations: typeof import("oak-common-aspect/src/locales").getTranslations;
    }>>;
    setAspectProxy(aspectProxy: AspectProxy<ED, Cxt, AD & typeof baseAspectDict>): void;
}
export declare function subscribe(callback: () => any): () => void;
/**
 * 方法注解，使函数调用最后一层堆栈时唤起所有登记的回调
 * @param target
 * @param propertyName
 * @param descriptor
 */
export declare function Action(target: any, propertyName: string, descriptor: TypedPropertyDescriptor<any>): void;
