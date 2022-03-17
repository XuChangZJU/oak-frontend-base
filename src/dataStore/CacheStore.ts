import { EntityDict as BaseEntityDict } from "oak-domain/lib/base-domain/EntityDict";
import { EntityDict } from 'oak-domain/lib/types/Entity';
import { StorageSchema } from "oak-domain/lib/types/Storage";
import { TreeStore } from 'oak-memory-tree-store';

export class CacheStore<ED extends EntityDict> extends TreeStore<ED> {
    constructor(storageSchema: StorageSchema<ED>) {
        super(storageSchema);
    }

    // todo 
}
