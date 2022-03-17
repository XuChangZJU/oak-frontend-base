import { Aspect } from "oak-domain/lib/types/Aspect";
import { EntityDict } from "oak-domain/lib/types/Entity";
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-domain/EntityDict';

export interface AspectProxy<ED extends EntityDict, AD extends Record<string, Aspect<ED>>> {
    <T extends keyof AD>(name: T, params: Parameters<AD[T]>[0]): Promise<ReturnType<AD[T]>>;
};
