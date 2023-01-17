import { Feature } from "../types/Feature";
import { EntityDict, Aspect, AspectWrapper } from 'oak-domain/lib/types';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
import { CommonAspectDict } from 'oak-common-aspect';

import { AsyncContext } from 'oak-domain/lib/store/AsyncRowStore';
import { SyncContext } from 'oak-domain/lib/store/SyncRowStore';

export class Port<
    ED extends EntityDict & BaseEntityDict,
    Cxt extends AsyncContext<ED>,
    AD extends CommonAspectDict<ED, Cxt> & Record<string, Aspect<ED, Cxt>>
> extends Feature {
    private aspectWrapper: AspectWrapper<ED, Cxt, AD>;

    constructor(aspectWrapper: AspectWrapper<ED, Cxt, AD>) {
        super();
        this.aspectWrapper = aspectWrapper;
    }

    importEntity<T extends keyof ED>(entity: T, id: string, file: File, option: Object) {
        const formData = new FormData();
        formData.set('entity', entity as string);
        formData.set('id', id);
        formData.set('file', file);
        formData.set('option', JSON.stringify(option));

        return this.aspectWrapper.exec('importEntity', formData);
    }

    exportEntity<T extends keyof ED>(entity: T, id: string, filter?: ED[T]['Selection']['filter']) {
        return this.aspectWrapper.exec('exportEntity', { entity, id, filter });
    }
}