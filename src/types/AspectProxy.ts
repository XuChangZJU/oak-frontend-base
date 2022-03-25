import { Aspect } from "oak-domain/lib/types/Aspect";
import { EntityDict } from "oak-domain/lib/types/Entity";
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-domain/EntityDict';

export type AspectProxy<ED extends EntityDict, AD extends Record<string, Aspect<ED>>> = {
    [K in keyof AD]: (p: Parameters<AD[K]>[0]) => ReturnType<AD[K]>;
};
