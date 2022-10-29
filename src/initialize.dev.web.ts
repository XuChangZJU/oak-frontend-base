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
} from 'oak-domain/lib/types';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
import { EntityDict } from 'oak-domain/lib/types/Entity';

import { Feature } from './types/Feature';

import { BasicFeatures } from './features';
import { ActionDictOfEntityDict } from 'oak-domain/lib/types/Action';
import { CommonAspectDict } from 'oak-common-aspect';
import { OakComponentOption } from './types/Page';
import { createComponent } from './page.web';
import { initialize as initDev } from './initialize-dev';
import { getI18next, I18nOptions } from './platforms/web/i18n';

export function initialize<
    ED extends EntityDict & BaseEntityDict,
    Cxt extends Context<ED>,
    AD extends Record<string, Aspect<ED, Cxt>>,
    FD extends Record<string, Feature>
>(
    storageSchema: StorageSchema<ED>,
    createFeatures: (
        aspectWrapper: AspectWrapper<ED, Cxt, AD>,
        basicFeatures: BasicFeatures<ED, Cxt, AD & CommonAspectDict<ED, Cxt>>,
    ) => FD,
    frontendContextBuilder: (features: FD & BasicFeatures<ED, Cxt, AD & CommonAspectDict<ED, Cxt>>) => (store: RowStore<ED, Cxt>) => Cxt,
    backendContextBuilder: (contextStr?: string) => (store: RowStore<ED, Cxt>) =>  Promise<Cxt>,
    aspectDict: AD,
    triggers?: Array<Trigger<ED, keyof ED, Cxt>>,
    checkers?: Array<Checker<ED, keyof ED, Cxt>>,
    watchers?: Array<Watcher<ED, keyof ED, Cxt>>,
    initialData?: {
        [T in keyof ED]?: Array<ED[T]['OpSchema']>;
    },
    actionDict?: ActionDictOfEntityDict<ED>,
    i18nOptions?: I18nOptions
) {
    const { features } = initDev<ED, Cxt, AD, FD>(
        storageSchema,
        createFeatures,
        frontendContextBuilder,
        backendContextBuilder,
        aspectDict,
        triggers,
        checkers,
        watchers,
        initialData,
        actionDict
    );

    // 初始化i8n配置
    const i18n = getI18next(i18nOptions);

    Object.assign(global, {
        OakComponent: <
            T extends keyof ED,
            Proj extends ED[T]['Selection']['data'],
            FormedData extends WechatMiniprogram.Component.DataOption,
            IsList extends boolean,
            TData extends WechatMiniprogram.Component.DataOption = {},
            TProperty extends WechatMiniprogram.Component.PropertyOption = {},
            TMethod extends WechatMiniprogram.Component.MethodOption = {}
        >(
            options: OakComponentOption<
                ED,
                T,
                Cxt,
                AD,
                FD,
                Proj,
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
                AD,
                FD,
                Proj,
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
