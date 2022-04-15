import { pull } from 'lodash';
import { EntityDict, Aspect, Context } from 'oak-domain/lib/types';
import { AspectProxy } from './AspectProxy';


export abstract class Feature<ED extends EntityDict, Cxt extends Context<ED>, AD extends Record<string, Aspect<ED, Cxt>>> {
    private aspectProxy?: AspectProxy<ED, Cxt, AD>;

    protected getAspectProxy() {
        return this.aspectProxy!;
    }

    setAspectProxy(aspectProxy: AspectProxy<ED, Cxt, AD>) {
        this.aspectProxy = aspectProxy;
    }
}


const mCallbacks: Array<() => void> = [];
let mActionStackDepth = 0;

export function subscribe(callback: () => void) {
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
    descriptor.value = async function () {
        mActionStackDepth++;
        let result;
        try {
            result = await method.apply(this, arguments);
        }
        catch (err) {
            mActionStackDepth--;
            throw err;
        }
        mActionStackDepth--;
        if (mActionStackDepth === 0) {
            mCallbacks.forEach(
                ele => ele()
            );
        }
        return result;
    }
}