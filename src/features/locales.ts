import { EntityDict, Aspect, Context, AspectWrapper } from 'oak-domain/lib/types';
import { Feature } from '../types/Feature';
import { CommonAspectDict } from 'oak-common-aspect';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
import { AsyncContext } from 'oak-domain/lib/store/AsyncRowStore';


export class Locales<ED extends EntityDict & BaseEntityDict, Cxt extends AsyncContext<ED>, AD extends CommonAspectDict<ED, Cxt>> extends Feature {
    private aspectWrapper: AspectWrapper<ED, Cxt, AD>;

    constructor(aspectWrapper: AspectWrapper<ED, Cxt, AD>) {
        super();
        this.aspectWrapper = aspectWrapper;
    }
    async get(namespace: string | string[], locale: string, scene: string) {
        const { result } = await this.aspectWrapper.exec('getTranslations',
            { namespace, locale },
        );

        return {
            translations: result,
        };
    }
}
