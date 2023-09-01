import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
import { ActionDictOfEntityDict, CascadeRemoveDefDict, ColorDict, Importation, Exportation } from 'oak-domain/lib/types';
import { AuthCascadePath, AuthDeduceRelationMap, EntityDict } from 'oak-domain/lib/types/Entity';

export type InitializeOptions<ED extends EntityDict & BaseEntityDict> = {
    actionDict: ActionDictOfEntityDict<ED>;
    actionCascadePathGraph: AuthCascadePath<ED>[];
    relationCascadePathGraph: AuthCascadePath<ED>[];
    authDeduceRelationMap: AuthDeduceRelationMap<ED>;
    colorDict: ColorDict<ED>;
    importations?: Importation<ED, keyof ED, any>[];
    exportations?: Exportation<ED, keyof ED, any>[];
    selectFreeEntities?: (keyof ED)[];
    createFreeEntities?: (keyof ED)[];
    updateFreeEntities?: (keyof ED)[];
    cacheSavedEntities?: (keyof ED)[];
    cacheKeepFreshPeriod?: number;
};
