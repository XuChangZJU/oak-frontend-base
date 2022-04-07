import { EntityDict } from 'oak-domain/lib/types/Entity';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-domain/EntityDict';
import { Context as BaseContext } from 'oak-memory-tree-store';
import { StorageSchema } from 'oak-domain/lib/types/Storage';
import { Cache } from './features/cache';
import { CacheStore } from './dataStore/CacheStore';
import { judgeRelation } from 'oak-domain/lib/schema/relation';

export class FrontContext<ED extends EntityDict> extends BaseContext<ED> {
};