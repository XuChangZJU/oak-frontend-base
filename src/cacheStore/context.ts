import { EntityDef } from "oak-domain/lib/types/Entity";
import { Context as BaseContext } from 'oak-memory-tree-store';

export class CacheContext<ED extends {
    [E: string]: EntityDef;
}> extends BaseContext<ED> {

};