import { EntityDict, Aspect, Context } from "oak-domain/lib/types";

export type AspectProxy<ED extends EntityDict, Cxt extends Context<ED>, AD extends Record<string, Aspect<ED, Cxt>>> = {
    [K in keyof AD]: (p: Parameters<AD[K]>[0]) => ReturnType<AD[K]>;
};
