import { pull } from 'oak-domain/lib/utils/lodash';
import { EntityDict, Aspect, AspectWrapper, Context } from 'oak-domain/lib/types';
import { CommonAspectDict } from 'oak-common-aspect';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';



export abstract class Feature<ED extends EntityDict & BaseEntityDict, Cxt extends Context<ED>, AD extends CommonAspectDict<ED, Cxt>> {
    private aspectWrapper: AspectWrapper<ED, Cxt, AD>;
    constructor(aspectWrapper: AspectWrapper<ED, Cxt, AD>) {
        this.aspectWrapper = aspectWrapper;
    }

    protected getAspectWrapper() {
        return this.aspectWrapper!;
    }
}


const mCallbacks: Array<() => any> = [];
let mActionStackDepth = 0;

export function subscribe(callback: () => any) {
    mCallbacks.push(callback);
    return () => {
        pull(mCallbacks, callback);
    }; 
}

/**
 * 方法注解，使函数调用最后一层堆栈时唤起所有登记的回调
 * @param target 
 * @param propertyName 
 * @param descriptor 
 */
 export function Action(target: any, propertyName: string, descriptor: TypedPropertyDescriptor<any>) {
    const method = descriptor.value!;
    descriptor.value = async function (...params: any[]) {
        mActionStackDepth++;
        if (mActionStackDepth > 20) {
            console.error(`action[${method.name}]调用的层级超过了20，请检查是否存在无限递归`);
        }
        let result;
        try {
            result = await method.apply(this, params);
        }
        catch (err) {
            // console.error(err, method.name);
            mActionStackDepth--;
            throw err;
        }
        mActionStackDepth--;
        if (mActionStackDepth === 0) {
            const results = mCallbacks.map(
                ele => ele()
            ).filter(
                ele => ele instanceof Promise
            );
            if (results.length > 0) {
                await Promise.all(results);
            }
        }
        return result;
    }
}