import './utils/wx.polyfill';
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
    Routine,
    Timer,
    AuthDefDict,
} from 'oak-domain/lib/types';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
import { EntityDict } from 'oak-domain/lib/types/Entity';
import { Exportation, Importation } from 'oak-domain/lib/types/Port';

import { Feature } from './types/Feature';

import { BasicFeatures } from './features';
import { ActionDictOfEntityDict } from 'oak-domain/lib/types/Action';
import { CommonAspectDict } from 'oak-common-aspect';
import { createComponent } from './page.web';
import { initialize as initDev } from './initialize-dev';
import { getI18next, I18nOptions } from './platforms/web/i18n';
import { AsyncContext, AsyncRowStore } from 'oak-domain/lib/store/AsyncRowStore';
import { SyncContext } from 'oak-domain/lib/store/SyncRowStore';
import { CacheStore } from './cacheStore/CacheStore';
import { 
    DataOption,
    PropertyOption,
    MethodOption,
    OakComponentOption } from './types/Page';

export function initialize<
    ED extends EntityDict & BaseEntityDict,
    Cxt extends AsyncContext<ED>,
    FrontCxt extends SyncContext<ED>,
    AD extends Record<string, Aspect<ED, Cxt>>,
    FD extends Record<string, Feature>
>(
    storageSchema: StorageSchema<ED>,
    createFeatures: (
        basicFeatures: BasicFeatures<ED, Cxt, FrontCxt, AD & CommonAspectDict<ED, Cxt>>,
    ) => FD,
    frontendContextBuilder: (features: FD & BasicFeatures<ED, Cxt, FrontCxt, AD & CommonAspectDict<ED, Cxt>>) => (store: CacheStore<ED, FrontCxt>) => FrontCxt,
    backendContextBuilder: (contextStr?: string) => (store: AsyncRowStore<ED, Cxt>) =>  Promise<Cxt>,
    aspectDict: AD,
    triggers?: Array<Trigger<ED, keyof ED, Cxt>>,
    checkers?: Array<Checker<ED, keyof ED, FrontCxt | Cxt>>,
    watchers?: Array<Watcher<ED, keyof ED, Cxt>>,
    timers?: Array<Timer<ED, Cxt>>,
    startRoutines?: Array<Routine<ED, Cxt>>,
    initialData?: {
        [T in keyof ED]?: Array<ED[T]['OpSchema']>;
    },
    actionDict?: ActionDictOfEntityDict<ED>,
    authDict?: AuthDefDict<ED>,
    i18nOptions?: I18nOptions,
    importations?: Importation<ED, keyof ED, any>[],
    exportations?: Exportation<ED, keyof ED, any>[]

) {
    const { features } = initDev<ED, Cxt, FrontCxt, AD, FD>(
        storageSchema,
        createFeatures,
        frontendContextBuilder,
        backendContextBuilder,
        aspectDict,
        triggers,
        checkers,
        watchers,
        timers,
        startRoutines,
        initialData,
        actionDict,
        authDict,
        importations,
        exportations
    );

    // 初始化i8n配置
    const i18n = getI18next(i18nOptions);

    Object.assign(global, {
        OakComponent: <
            T extends keyof ED,
            FormedData extends DataOption,
            IsList extends boolean,
            TData extends DataOption = {},
            TProperty extends PropertyOption = {},
            TMethod extends MethodOption = {}
        >(
            options: OakComponentOption<
                ED,
                T,
                Cxt,
                FrontCxt,
                AD,
                FD,
                FormedData,
                IsList,
                TData,
                TProperty,
                TMethod
            >
        ) =>
            createComponent<
                ED,
                T,
                Cxt,
                FrontCxt,
                AD,
                FD,
                FormedData,
                IsList,
                TData,
                TProperty,
                TMethod
            >(options, features),
    });

    return {
        i18n,
        features,
    };
}
