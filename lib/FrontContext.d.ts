import { EntityDict } from 'oak-domain/lib/types/Entity';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-domain/EntityDict';
import { Context as BaseContext } from 'oak-memory-tree-store';
export declare class FrontContext<ED extends EntityDict & BaseEntityDict> extends BaseContext<ED> {
}
