import { EntityDef } from 'oak-domain/lib/types/entity';
import { Aspect } from 'oak-domain/lib/types/Aspect';
import { Context as BaseContext } from 'oak-memory-tree-store';

export class FrontContext<ED extends Record<string, EntityDef>> extends BaseContext<ED> {
};