import { Feature } from "../types/Feature";
import { EntityDict, Aspect, AspectWrapper } from 'oak-domain/lib/types';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
import { CommonAspectDict } from 'oak-common-aspect';

import { AsyncContext } from 'oak-domain/lib/store/AsyncRowStore';

export class Geo<
    ED extends EntityDict & BaseEntityDict,
    Cxt extends AsyncContext<ED>,
    AD extends CommonAspectDict<ED, Cxt> & Record<string, Aspect<ED, Cxt>>
> extends Feature {
    private aspectWrapper: AspectWrapper<ED, Cxt, AD>;

    constructor(aspectWrapper: AspectWrapper<ED, Cxt, AD>) {
        super();
        this.aspectWrapper = aspectWrapper;
    }

    searchPoi(value: string, areaCode?: string, typeCode?: string, indexFrom?: number, count?: number) {
        return this.aspectWrapper.exec('searchPoi', {
            value,
            areaCode,
            typeCode,
            indexFrom,
            count,
        });
    }

}