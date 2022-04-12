import { Aspect } from "oak-general-business";
import { EntityDict } from "oak-domain/lib/types/Entity";

export type AspectProxy<ED extends EntityDict, AD extends Record<string, Aspect<ED>>> = {
    [K in keyof AD]: (p: Parameters<AD[K]>[0]) => ReturnType<AD[K]>;
};
