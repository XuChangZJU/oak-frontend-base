import { Feature } from '../types/Feature';
import { EntityDict } from 'oak-domain/lib/types';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
import { CommonAspectDict } from 'oak-common-aspect';
import { SyncContext } from 'oak-domain/lib/store/SyncRowStore';
import { AsyncContext } from 'oak-domain/lib/store/AsyncRowStore';
import { firstLetterUpperCase } from 'oak-domain/lib/utils/string';
import { uniq } from 'oak-domain/lib/utils/lodash';
import { Cache } from './cache';

export class Relation<
    ED extends EntityDict & BaseEntityDict,
    Cxt extends AsyncContext<ED>,
    FrontCxt extends SyncContext<ED>,
    AD extends CommonAspectDict<ED, Cxt>
> extends Feature {
    private cache: Cache<ED, Cxt, FrontCxt, AD>;
    private relationDict: {
        [K in keyof ED]?: {
            [R in NonNullable<ED[K]['Relation']>]?: ED[K]['Relation'][];
        }
    };

    constructor(cache: Cache<ED, Cxt, FrontCxt, AD>, relationDict: {
        [K in keyof ED]?: {
            [R in NonNullable<ED[K]['Relation']>]?: ED[K]['Relation'][];
        }
    }) {
        super();
        this.cache = cache;
        this.relationDict = relationDict;
    }

    /**
     * 这里本用户可以访问的relation应该用checker去逐个检查
     * @param entity 
     * @param userId 
     * @param entityId 
     * @returns 
     */
    getLegalRelations<T extends keyof ED>(entity: T, userId: string, entityId: string) {
        const { relation } = this.cache.getSchema()[entity]!;
        const relationEntity = `user${firstLetterUpperCase(entity as string)}`;
        const legalRelations: ED[T]['Relation'][] = [];
        relation!.forEach(
            ele => {
                const legal = this.cache.checkOperation(relationEntity as keyof ED, 'create', {
                    relation: ele,
                    [`${entity as string}Id`]: entityId,
                }, undefined, ['logical', 'logicalRelation', 'relation']);
                if (legal) {
                    legalRelations.push(ele);
                }
            }
        );
        return legalRelations;
    }

}
