import { pull } from 'lodash';
import { Aspect } from 'oak-domain/lib/types/Aspect';
import { EntityDict } from 'oak-domain/lib/types/entity';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-domain/EntityDict';
import { FrontContext } from '../FrontContext';

export abstract class Feature<ED extends EntityDict, AD extends Record<string, Aspect<ED>>> {
    private callbackSet: Array<() => void>;
    constructor() {
        this.callbackSet = [];
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

    abstract get(context: FrontContext<ED, AD>, params?: any): Promise<any>;

    abstract action(context: FrontContext<ED, AD>, type: string, payload?: any): Promise<any>;
}