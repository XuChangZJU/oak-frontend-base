import {
    MakeOakComponent,
} from '../src/types/Page';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
import { EntityDict, Aspect } from 'oak-domain/lib/types';
import { Feature } from '../src/types/Feature';
import { AsyncContext } from "oak-domain/lib/store/AsyncRowStore";
import { SyncContext } from "oak-domain/lib/store/SyncRowStore";
type ED = EntityDict & BaseEntityDict;
type Cxt = AsyncContext<ED>;
type FrontCxt = SyncContext<ED>;
type AD = Record<string, Aspect<ED, Cxt>>;
type FD = Record<string, Feature>
declare global {
    const OakComponent: MakeOakComponent<
        ED,
        Cxt,
        FrontCxt,
        AD,
        FD
    >;
}
export {};
