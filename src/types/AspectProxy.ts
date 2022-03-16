import { Aspect } from "oak-domain/lib/types/Aspect";
import { EntityDef } from "oak-domain/lib/types/Entity";

export interface AspectProxy<ED extends Record<string, EntityDef>, AD extends Record<string, Aspect<ED>>> {
    <T extends keyof AD>(name: T, params: Parameters<AD[T]>[0]): ReturnType<AD[T]>;
};
