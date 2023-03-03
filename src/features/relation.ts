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

    getChildrenRelations<T extends keyof ED>(entity: T, userId: string, entityId: string) {
        const relationEntity = `user${firstLetterUpperCase(entity as string)}`;
        const userRelations = this.cache.get(relationEntity as keyof ED, {
            data: {
                id: 1,
                relation: 1,
            },
            filter: {
                userId,
                [`${entity as string}Id`]: entityId,
            }
        });
        if (userRelations.length > 0) {
            const relations = userRelations.map(ele => ele.relation) as NonNullable<ED[T]['Relation']>[];
            const childrenRelations = [] as ED[T]['Relation'][];
            relations.forEach(
                (relation) => {
                    if (this.relationDict[entity] && this.relationDict[entity]![relation]) {
                        childrenRelations.push(...this.relationDict[entity]![relation]!);
                    }
                }
            );
            if (childrenRelations.length > 0) {
                return uniq(childrenRelations);
            }
        }
    }

}
