import { EntityDict, Aspect, Context } from 'oak-domain/lib/types';
import { AspectProxy } from './AspectProxy';
import baseAspectDict from '../aspects';
export declare abstract class Feature<ED extends EntityDict, Cxt extends Context<ED>, AD extends Record<string, Aspect<ED, Cxt>>> {
    private aspectProxy?;
    protected getAspectProxy(): NonNullable<AspectProxy<ED, Cxt, AD & {
        operate: typeof import("../aspects/crud").operate;
        select: typeof import("../aspects/crud").select;
        amap: typeof import("../aspects/amap").amap;
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
