import { EntityDef } from "oak-domain/lib/types/Entity";
import { Context as BaseContext } from 'oak-debug-store';
export declare class Context<ED extends {
    [E: string]: EntityDef;
}> extends BaseContext<ED> {
}
