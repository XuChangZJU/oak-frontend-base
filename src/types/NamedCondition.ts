import { EntityDict } from "oak-domain/lib/types";

export type NamedFilterItem<ED extends EntityDict, T extends keyof ED> = {
    filter: ED[T]['Selection']['filter'] | (() => ED[T]['Selection']['filter'] | undefined);
    ['#name']?: string;
};

export type NamedSorterItem<ED extends EntityDict, T extends keyof ED> = {
    sorter: NonNullable<ED[T]['Selection']['sorter']>[number] | (() => NonNullable<ED[T]['Selection']['sorter']>[number] | undefined);
    ['#name']?: string;
};