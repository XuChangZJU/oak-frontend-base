import { EntityDict, AspectWrapper, Context } from 'oak-domain/lib/types';
import { AspectDict } from 'oak-common-aspect/src/aspectDict';
export declare abstract class Feature<ED extends EntityDict, Cxt extends Context<ED>, AD extends AspectDict<ED, Cxt>> {
    private aspectWrapper;
    constructor(aspectWrapper: AspectWrapper<ED, Cxt, AD>);
    protected getAspectWrapper(): AspectWrapper<ED, Cxt, AD>;
}
export declare function subscribe(callback: () => any): () => void;
/**
 * 方法注解，使函数调用最后一层堆栈时唤起所有登记的回调
 * @param target
 * @param propertyName
 * @param descriptor
 */
export declare function Action(target: any, propertyName: string, descriptor: TypedPropertyDescriptor<any>): void;
