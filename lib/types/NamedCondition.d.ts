import { EntityDict } from "oak-domain/lib/types";
import { DeduceSorterItem } from "oak-domain/lib/types/Entity";
export declare type NamedFilterItem<ED extends EntityDict, T extends keyof ED> = {
    filter: ED[T]['Selection']['filter'] | (() => Promise<ED[T]['Selection']['filter']>);
    ['#name']?: string;
};
export declare type NamedSorterItem<ED extends EntityDict, T extends keyof ED> = {
    sorter: DeduceSorterItem<ED[T]['Schema']> | (() => Promise<DeduceSorterItem<ED[T]['Schema']>>);
    ['#name']?: string;
};
