import { AsyncContext } from 'oak-domain/lib/store/AsyncRowStore';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
import { ActionDictOfEntityDict, ColorDict, Importation, Exportation, AttrUpdateMatrix } from 'oak-domain/lib/types';
import { AuthDeduceRelationMap, EntityDict } from 'oak-domain/lib/types/Entity';
export type InitializeOptions<ED extends EntityDict & BaseEntityDict, Cxt extends AsyncContext<ED>> = {
    actionDict: ActionDictOfEntityDict<ED>;
    attrUpdateMatrix?: AttrUpdateMatrix<ED>;
    authDeduceRelationMap: AuthDeduceRelationMap<ED>;
    colorDict: ColorDict<ED>;
    importations?: Importation<ED, keyof ED, any, Cxt>[];
    exportations?: Exportation<ED, keyof ED, any, Cxt>[];
    selectFreeEntities?: (keyof ED)[];
    updateFreeDict?: {
        [A in keyof ED]?: string[];
    };
    cacheSavedEntities?: (keyof ED)[];
    cacheKeepFreshPeriod?: number;
};
