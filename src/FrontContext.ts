import { EntityDict } from 'oak-domain/lib/types/Entity';
import { Context as BaseContext } from 'oak-memory-tree-store';

export class FrontContext<ED extends EntityDict> extends BaseContext<ED> {
};