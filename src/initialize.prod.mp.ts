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
import { EntityDict } from 'oak-domain/lib/types/Entity';

import { Feature } from './types/Feature';

import { BasicFeatures } from './features';
import { assign } from 'lodash';
import { ActionDictOfEntityDict } from 'oak-domain/lib/types/Action';
import { CommonAspectDict } from 'oak-common-aspect';
import { ExceptionHandler, ExceptionRouters } from './types/ExceptionRoute';
import { OakComponentOption, OakPageOption } from './types/Page';
import { createComponent, createPage } from './page.mp';
import { initialize as initProd } from './initialize-prod';
import { initI18nWechatMp } from './platforms/wechatMp/i18n';

export function initialize<
    ED extends EntityDict,
    Cxt extends Context<ED>,
    AD extends Record<string, Aspect<ED, Cxt>>,
    FD extends Record<string, Feature<ED, Cxt, AD & CommonAspectDict<ED, Cxt>>>
>(
    storageSchema: StorageSchema<ED>,
    createFeatures: (
        aspectWrapper: AspectWrapper<ED, Cxt, AD>,
        basicFeatures: BasicFeatures<ED, Cxt, AD & CommonAspectDict<ED, Cxt>>,
        context: Cxt
    ) => FD,
    contextBuilder: (cxtString?: string) => (store: RowStore<ED, Cxt>) => Cxt,
    exceptionRouters: ExceptionRouters = [],
    connector: Connector<ED, Cxt>,
    checkers?: Array<Checker<ED, keyof ED, Cxt>>,
    actionDict?: ActionDictOfEntityDict<ED>,
    translations?: Record<string, any>
) {
    const { features, context } = initProd<ED, Cxt, AD, FD>(
        storageSchema,
        createFeatures,
        contextBuilder,
        connector,
        checkers,
        actionDict
    );

    const exceptionRouterDict: Record<string, ExceptionHandler> = {};
    for (const router of exceptionRouters) {
        assign(exceptionRouterDict, {
            [router[0].name]: router[1],
        });
    }
    // 初始化locales
    if (translations) {
        const systemInfo = wx.getSystemInfoSync();
        const { language } = systemInfo; // 系统语言
        let defaultLocale;
        if (language === 'zh_CN') {
            defaultLocale = language;
        }
        //初始化i18n
        initI18nWechatMp({
            locales: {
                translations,
            },
            defaultLocale,
        });
    }

    assign(global, {
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
            >(options, features, exceptionRouterDict, context),
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
            >(options, features, exceptionRouterDict, context),
    });
}
