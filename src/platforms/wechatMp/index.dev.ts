import './polyfill';
import { Aspect, Checker, Context, EntityDict, RowStore, StorageSchema, Trigger, ActionDictOfEntityDict, Watcher, AspectWrapper } from "oak-domain/lib/types";
import { Feature } from '../../types/Feature';
import { initialize as init } from '../../initialize.dev';
import { BasicFeatures } from "../../features";
import { assign } from "lodash";
import { ExceptionHandler, ExceptionRouters } from '../../types/ExceptionRoute';
import { AspectDict } from 'oak-common-aspect/src/aspectDict';
import { createComponentOptions, createPageOptions, mergeLifetimes, mergeMethods, mergePageLifetimes, OakComponentData, OakComponentInstanceProperties, OakComponentMethods, OakComponentOption, OakComponentProperties, OakPageData, OakPageInstanceProperties, OakPageMethods, OakPageOption, OakPageProperties, OakWechatMpOptions } from './index';


export function initialize<ED extends EntityDict, Cxt extends Context<ED>, AD extends Record<string, Aspect<ED, Cxt>>, FD extends Record<string, Feature<ED, Cxt, AD & AspectDict<ED, Cxt>>>>(
    storageSchema: StorageSchema<ED>,
    createFeatures: (aspectWrapper: AspectWrapper<ED, Cxt, AD> ,basicFeatures: BasicFeatures<ED, Cxt, AD & AspectDict<ED, Cxt>>, context: Cxt) => FD,
    contextBuilder: (cxtString?: string) => (store: RowStore<ED, Cxt>) => Cxt,
    contextCreator: (store: RowStore<ED, Cxt>) => Cxt,
    aspectDict: AD,
    exceptionRouters: ExceptionRouters = [],
    triggers?: Array<Trigger<ED, keyof ED, Cxt>>,
    checkers?: Array<Checker<ED, keyof ED, Cxt>>,
    watchers?: Array<Watcher<ED, keyof ED, Cxt>>,
    initialData?: {
        [T in keyof ED]?: Array<ED[T]['OpSchema']>;
    },
    actionDict?: ActionDictOfEntityDict<ED>
) {
    const { subscribe, features } = init<ED, Cxt, AD, FD>(storageSchema, createFeatures, contextBuilder, contextCreator, aspectDict, triggers, checkers, watchers, initialData, actionDict);
    const exceptionRouterDict: Record<string, ExceptionHandler> = {};
    for (const router of exceptionRouters) {
        assign(exceptionRouterDict, {
            [router[0].name]: router[1],
        });
    }

    return {
        OakPage: <
            T extends keyof ED,
            D extends WechatMiniprogram.Component.DataOption,
            P extends WechatMiniprogram.Component.PropertyOption,
            M extends WechatMiniprogram.Component.MethodOption,
            IsList extends boolean,
            Proj extends ED[T]['Selection']['data'],
            IS extends WechatMiniprogram.IAnyObject = {},
            FormedData extends WechatMiniprogram.Component.DataOption = {}>(
                options: OakPageOption<ED, T, Cxt, AD, FD, Proj, FormedData, IsList>,
                componentOptions: WechatMiniprogram.Component.Options<D, P, M, IS & OakPageInstanceProperties<ED, Cxt, AD, FD>, true> = {}) => {
            const oakOptions = createPageOptions<ED, T, Cxt, AD, FD, Proj, FormedData, IsList>(options, subscribe, features, exceptionRouterDict);
            const { properties, pageLifetimes, lifetimes, methods, data, observers } = oakOptions;
            const { properties: p2, pageLifetimes: pl2, lifetimes: l2, methods: m2, data: d2, observers: o2, ...restOptions } = componentOptions;

            const pls = [pageLifetimes!];
            if (pl2) {
                pls.push(pl2);
            }

            const ls = [lifetimes!];
            if (l2) {
                ls.push(l2);
            }
            return Component<
                D & OakPageData,
                P & OakPageProperties,
                M & OakComponentMethods<ED, T>,
                IS & OakComponentInstanceProperties<ED, Cxt, AD, FD>, true>({
                    data: assign({}, d2, data),
                    properties: assign({}, p2, properties),
                    observers: assign({}, o2, observers),
                    methods: (m2 ? mergeMethods([methods!, m2]) : methods!) as any,
                    pageLifetimes: mergePageLifetimes(pls),
                    lifetimes: mergeLifetimes(ls),
                    ...restOptions,
                });
        },

        OakComponent: <
            T extends keyof EntityDict,
            D extends WechatMiniprogram.Component.DataOption,
            P extends WechatMiniprogram.Component.PropertyOption,
            M extends WechatMiniprogram.Component.MethodOption,
            IsList extends boolean,
            IS extends WechatMiniprogram.IAnyObject = {},
            FormedData extends WechatMiniprogram.Component.DataOption = {}>(
                options: OakComponentOption<ED, T, Cxt, AD, FD, FormedData, IsList>,
                componentOptions: OakWechatMpOptions<
                    D,
                    P,
                    M,
                    OakPageProperties,
                    OakPageMethods<ED, T>,
                    OakPageData,
                    OakPageInstanceProperties<ED, Cxt, AD, FD>,
                    IS,
                    true
                > = {}) => {
            const oakOptions = createComponentOptions<ED, T, Cxt, AD, FD, IsList, FormedData>(options, subscribe, features, exceptionRouterDict);
            const { properties, pageLifetimes, lifetimes, methods, data, observers } = oakOptions;
            const { properties: p2, pageLifetimes: pl2, lifetimes: l2, methods: m2, data: d2, observers: o2, ...restOptions } = componentOptions;

            const pls = [pageLifetimes, pl2].filter(ele => !!ele) as Array<Partial<WechatMiniprogram.Component.PageLifetimes>>;
            const ls = [lifetimes, l2].filter(ele => !!ele) as Array<Partial<WechatMiniprogram.Component.Lifetimes>>;

            return Component<
                D & OakComponentData,
                P & OakComponentProperties,
                M & OakComponentMethods<ED, T>,
                IS & OakComponentInstanceProperties<ED, Cxt, AD, FD>, false>({
                    data: assign({}, d2, data),
                    properties: assign({}, p2, properties),
                    observers: assign({}, o2, observers),
                    methods: (m2 ? mergeMethods([methods!, m2]) : methods!) as any,
                    pageLifetimes: mergePageLifetimes(pls),
                    lifetimes: mergeLifetimes(ls),
                    ...restOptions,
                });
        },

        features,
    };
}
