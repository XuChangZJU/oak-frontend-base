import { EntityDef } from "oak-domain/lib/types/Entity";
import { TriggerEntityShape } from "oak-domain/lib/types/Trigger";
import { Context as BaseContext } from 'oak-debug-store';
export declare class Context<E extends string, ED extends {
    [K in E]: EntityDef<E, ED, K, SH>;
}, SH extends TriggerEntityShape = TriggerEntityShape> extends BaseContext<E, ED, SH> {
}
