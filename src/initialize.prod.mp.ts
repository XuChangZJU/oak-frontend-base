import './utils/wx.polyfill';
import {
    Aspect,
    AspectWrapper,
    Checker,
    StorageSchema,
    Context,
    RowStore,
    OakException,
    Connector,
} from 'oak-domain/lib/types';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
import { EntityDict } from 'oak-domain/lib/types/Entity';

import { Feature } from './types/Feature';

import { BasicFeatures } from './features';
import { ActionDictOfEntityDict } from 'oak-domain/lib/types/Action';
import { CommonAspectDict } from 'oak-common-aspect';
import { ExceptionHandler, ExceptionRouters } from './types/ExceptionRoute';
import { OakComponentOption, OakPageOption } from './types/Page';
import { createComponent, createPage } from './page.mp';
import { initialize as initProd } from './initialize-prod';
import { getI18next, I18nOptions } from './platforms/wechatMp/i18n';

export function initialize<
    ED extends EntityDict & BaseEntityDict,
    Cxt extends Context<ED>,
    AD extends Record<string, Aspect<ED, Cxt>>,
    FD extends Record<string, Feature<ED, Cxt, AD & CommonAspectDict<ED, Cxt>>>
>(
    storageSchema: StorageSchema<ED>,
    createFeatures: (
        aspectWrapper: AspectWrapper<ED, Cxt, AD>,
        basicFeatures: BasicFeatures<ED, Cxt, AD & CommonAspectDict<ED, Cxt>>,
    ) => FD,
    frontendContextBuilder: (features: FD & BasicFeatures<ED, Cxt, AD & CommonAspectDict<ED, Cxt>>) => (store: RowStore<ED, Cxt>) => Cxt,
    exceptionRouters: ExceptionRouters = [],
    connector: Connector<ED, Cxt>,
    checkers?: Array<Checker<ED, keyof ED, Cxt>>,
    actionDict?: ActionDictOfEntityDict<ED>,
    i18nOptions?: I18nOptions
) {
    const { features } = initProd<ED, Cxt, AD, FD>(
        storageSchema,
        createFeatures,
        frontendContextBuilder,
        connector,
        checkers,
        actionDict
    );

    const exceptionRouterDict: Record<string, ExceptionHandler> = {};
    for (const router of exceptionRouters) {
        Object.assign(exceptionRouterDict, {
            [router[0].name]: router[1],
        });
    }
    // 初始化locales
    const i18n = getI18next(i18nOptions);

    Object.assign(global, {
        OakPage: <
            T extends keyof ED,
            Proj extends ED[T]['Selection']['data'],
            FormedData extends WechatMiniprogram.Component.DataOption,
            IsList extends boolean,
            TData extends WechatMiniprogram.Component.DataOption = {},
            TProperty extends WechatMiniprogram.Component.PropertyOption = {},
            TMethod extends WechatMiniprogram.Component.MethodOption = {}
        >(
            options: OakPageOption<
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
            createPage<
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
            >(options, features, exceptionRouterDict),
        OakComponent: <
            T extends keyof ED,
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
                FormedData,
                IsList,
                TData,
                TProperty,
                TMethod
            >(options, features, exceptionRouterDict),
    });

    return {
        i18n,
        features,
    };
}
