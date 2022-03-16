import { OperationResult, EntityDef, DeduceOperation } from "oak-domain/lib/types/Entity";
import { TriggerEntityShape } from "oak-domain/lib/types/Trigger";
import { Context as BaseContext } from 'oak-debug-store';

export class Context<ED extends {
    [E: string]: EntityDef;
}> extends BaseContext<ED> {

};