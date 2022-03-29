import { DeduceFilter, DeduceUpdateOperation, EntityDict, OperationResult } from 'oak-domain/lib/types/Entity';
import { Aspect } from 'oak-domain/lib/types/Aspect';
import { Feature } from '../types/Feature';
import { Cache } from './cache';
import { FrontContext } from '../FrontContext';
export declare class Node<ED extends EntityDict, AD extends Record<string, Aspect<ED>>, T extends keyof ED> {
    protected entity: T;
    protected projection?: ED[T]['Selection']['data'];
    protected cache: Cache<ED, AD>;
    private parent?;
    protected updateData?: DeduceUpdateOperation<ED[T]['OpSchema']>;
    constructor(entity: T, cache: Cache<ED, AD>, projection?: ED[T]['Selection']['data'], parent?: Node<ED, AD, keyof ED>);
    doRefresh(context: FrontContext<ED>, filter?: ED[T]['Selection']['filter'], sorter?: ED[T]['Selection']['sorter'], indexFrom?: number, count?: number): OperationResult;
}
declare class ListNode<ED extends EntityDict, AD extends Record<string, Aspect<ED>>, T extends keyof ED> extends Node<ED, AD, T> {
    private ids;
    private children;
    private append;
    private filters;
    private sorter?;
    private indexFrom?;
    private count?;
    private hasMore?;
    private total?;
    constructor(entity: T, cache: Cache<ED, AD>, projection?: ED[T]['Selection']['data'], parent?: Node<ED, AD, keyof ED>, filters?: DeduceFilter<ED[T]['Schema']>[], sorter?: ED[T]['Selection']['sorter'], append?: boolean);
    addChild(path: number, node: Node<ED, AD, T>): void;
    refresh(context: FrontContext<ED>): Promise<void>;
    getData(context: FrontContext<ED>, projection: ED[T]['Selection']['data']): Promise<Partial<ED[T]["Schema"] & {
        $expr?: any;
        $expr1?: any;
        $expr2?: any;
        $expr3?: any;
        $expr4?: any;
        $expr5?: any;
        $expr6?: any;
        $expr7?: any;
        $expr8?: any;
        $expr9?: any;
        $expr10?: any;
        $expr11?: any;
        $expr12?: any;
        $expr13?: any;
        $expr14?: any;
        $expr15?: any;
        $expr16?: any;
        $expr17?: any;
        $expr18?: any;
        $expr19?: any;
        $expr20?: any;
    }>[] | undefined>;
    nextPage(): Promise<void>;
    prevPage(): Promise<void>;
}
declare class SingleNode<ED extends EntityDict, AD extends Record<string, Aspect<ED>>, T extends keyof ED> extends Node<ED, AD, T> {
    private id?;
    private children;
    constructor(entity: T, cache: Cache<ED, AD>, projection?: ED[T]['Selection']['data'], parent?: Node<ED, AD, keyof ED>, id?: string);
    refresh(context: FrontContext<ED>): Promise<void>;
    addChild(path: string, node: Node<ED, AD, keyof ED>): void;
    getData(context: FrontContext<ED>, projection: ED[T]['Selection']['data']): Promise<Partial<ED[T]["Schema"] & {
        $expr?: any;
        $expr1?: any;
        $expr2?: any;
        $expr3?: any;
        $expr4?: any;
        $expr5?: any;
        $expr6?: any;
        $expr7?: any;
        $expr8?: any;
        $expr9?: any;
        $expr10?: any;
        $expr11?: any;
        $expr12?: any;
        $expr13?: any;
        $expr14?: any;
        $expr15?: any;
        $expr16?: any;
        $expr17?: any;
        $expr18?: any;
        $expr19?: any;
        $expr20?: any;
    }>[]>;
}
declare type InitNodeAction<ED extends EntityDict, AD extends Record<string, Aspect<ED>>, T extends keyof ED> = {
    type: 'init';
    payload: {
        entity: T;
        isList: boolean;
        path?: string | number;
        parent?: Node<ED, AD, keyof ED>;
        id?: string;
        projection?: ED[T]['Selection']['data'];
        filters?: DeduceFilter<ED[T]['Schema']>[];
        sorter?: ED[T]['Selection']['sorter'];
        append?: boolean;
    };
};
declare type GetData<ED extends EntityDict, AD extends Record<string, Aspect<ED>>, T extends keyof ED> = {
    type: 'data';
    payload: {
        node: Node<ED, AD, T>;
        projection: ED[T]['Selection']['data'];
    };
};
export declare class RunningNode<ED extends EntityDict, AD extends Record<string, Aspect<ED>>> extends Feature<ED, AD> {
    private cache;
    constructor(cache: Cache<ED, AD>);
    get<T extends keyof ED>(context: FrontContext<ED>, params: GetData<ED, AD, T>): Promise<Partial<ED[T]["Schema"] & {
        $expr?: any;
        $expr1?: any;
        $expr2?: any;
        $expr3?: any;
        $expr4?: any;
        $expr5?: any;
        $expr6?: any;
        $expr7?: any;
        $expr8?: any;
        $expr9?: any;
        $expr10?: any;
        $expr11?: any;
        $expr12?: any;
        $expr13?: any;
        $expr14?: any;
        $expr15?: any;
        $expr16?: any;
        $expr17?: any;
        $expr18?: any;
        $expr19?: any;
        $expr20?: any;
    }>[] | undefined>;
    action<T extends keyof ED>(context: FrontContext<ED>, action: InitNodeAction<ED, AD, T>): ListNode<ED, AD, T> | SingleNode<ED, AD, T>;
}
export {};
