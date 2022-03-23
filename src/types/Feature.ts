import { pull } from 'lodash';
import { Aspect } from 'oak-domain/lib/types/Aspect';
import { EntityDict } from 'oak-domain/lib/types/Entity';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-domain/EntityDict';
import { aspectDict as basicAspectDict} from 'oak-basic-business';
import { FrontContext } from '../FrontContext';
import { AspectProxy } from './AspectProxy';

export abstract class Feature<ED extends EntityDict & BaseEntityDict, AD extends Record<string, Aspect<ED>>> {
    private callbackSet: Array<() => void>;
    protected aspectProxy: AspectProxy<ED, AD & typeof basicAspectDict>;
    protected context: FrontContext<ED>;

    constructor(context: FrontContext<ED>, aspectProxy: AspectProxy<ED, AD & typeof basicAspectDict>) {
        this.callbackSet = [];
        this.context = context;
        this.aspectProxy = aspectProxy;
    }

    public subscribe(callback: () => void): () => void {
        this.callbackSet.push(callback);
        return () => {
            pull(this.callbackSet, callback);
        };
    }

    protected notify() {
        this.callbackSet.forEach(
            ele => ele()
        );
    }

    abstract get(params?: any): Promise<any>;
}