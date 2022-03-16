import { EntityDict } from "oak-domain/lib/base-domain/EntityDict";
import { StorageSchema } from "oak-domain/lib/types/Storage";
import { TreeStore, Context as BaseContext } from 'oak-memory-tree-store';

export class CacheStore<ED extends EntityDict> extends TreeStore<ED> {
    constructor(storageSchema: StorageSchema<ED>) {
        super(storageSchema);
    }

    // todo 
}

export class Context<ED extends EntityDict> extends BaseContext<ED> {

};