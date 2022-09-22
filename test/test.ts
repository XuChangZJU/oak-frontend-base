import { CommonAspectDict } from 'oak-common-aspect';
import commonAspectDict from 'oak-common-aspect';
import {
    Aspect,
    AspectWrapper,
    Checker,
    Trigger,
    StorageSchema,
    Context,
    RowStore,
    OakRowInconsistencyException,
    Watcher,
} from 'oak-domain/lib/types';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
import { EntityDict } from 'oak-domain/lib/types/Entity';

function tt<ED extends EntityDict & BaseEntityDict, Cxt extends Context<ED>, AD extends CommonAspectDict<ED, Cxt>>(ad: AD) {
    console.log(111);
}

function init<
ED extends EntityDict & BaseEntityDict,
Cxt extends Context<ED>,
AD extends Record<string, Aspect<ED, Cxt>>
> (aspectDict: AD) {
    const ad2 = Object.assign({}, aspectDict, commonAspectDict);
    tt(ad2);
}

init({});

