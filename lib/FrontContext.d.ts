import { EntityDict } from 'oak-domain/lib/types/Entity';
import { Context as BaseContext } from 'oak-memory-tree-store';
export declare class FrontContext<ED extends EntityDict> extends BaseContext<ED> {
    topAction: boolean;
}
