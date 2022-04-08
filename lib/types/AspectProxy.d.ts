import { Aspect } from "oak-general-business/lib/types/Aspect";
import { EntityDict } from "oak-domain/lib/types/Entity";
export declare type AspectProxy<ED extends EntityDict, AD extends Record<string, Aspect<ED>>> = {
    [K in keyof AD]: (p: Parameters<AD[K]>[0]) => ReturnType<AD[K]>;
};
