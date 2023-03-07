

import { useFeatures as useCommonFeatures } from '../platforms/web/features';
import { BasicFeatures } from '../features';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
import {
    Aspect,
    EntityDict,
} from 'oak-domain/lib/types';
import { SyncContext } from 'oak-domain/lib/store/SyncRowStore';
import { AsyncContext } from 'oak-domain/lib/store/AsyncRowStore';

type ED = EntityDict & BaseEntityDict;
type Cxt = AsyncContext<ED>;
type FrontCxt = SyncContext<ED>;
type AD = Record<string, Aspect<ED, Cxt>>
        
// react 独有
export default function useFeatures() {
    return useCommonFeatures<BasicFeatures<ED, Cxt, FrontCxt, AD>>();
};