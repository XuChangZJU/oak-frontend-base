import { Aspect } from "oak-domain/lib/types/Aspect";
import { EntityDict } from "oak-domain/lib/types/Entity";
import { FrontContext } from "../FrontContext";

export type AspectProxy<ED extends EntityDict, AD extends Record<string, Aspect<ED>>> = {
    [K in keyof AD]: (p: Parameters<AD[K]>[0], frontContext: FrontContext<ED>) => ReturnType<AD[K]>;
};
