import { pull } from 'lodash';
import { EntityDef } from 'oak-domain/lib/types/entity';
import { FrontContext } from './FrontContext';

export abstract class Feature<ED extends Record<string, EntityDef>> {
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

    abstract get(params?: any): any;

    abstract action(context: FrontContext<ED>, type: string, payload?: any): any;
}