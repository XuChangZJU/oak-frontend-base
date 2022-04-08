import { pull } from 'lodash';
import { Aspect } from 'oak-general-business/lib/types/Aspect';
import { EntityDict } from 'oak-domain/lib/types/Entity';
import { aspectDict as basicAspectDict} from 'oak-general-business';
import { FrontContext } from '../FrontContext';
import { AspectProxy } from './AspectProxy';


export abstract class Feature<ED extends EntityDict, AD extends Record<string, Aspect<ED>>> {
    private aspectProxy?: AspectProxy<ED, AD & typeof basicAspectDict>;
    private context?: FrontContext<ED>;

    protected getAspectProxy() {
        return this.aspectProxy!;
    }

    setAspectProxy(aspectProxy: AspectProxy<ED, AD & typeof basicAspectDict>) {
        this.aspectProxy = aspectProxy;
    }

    protected getContext() {
        return this.context!;
    }

    setContext(context: FrontContext<ED>) {
        this.context = context;
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