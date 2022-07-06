import { assign, omit } from 'lodash';
import URL from 'url';
import { CommonAspectDict } from 'oak-common-aspect';
import { Aspect, Context, EntityDict } from 'oak-domain/lib/types';
import { BasicFeatures } from './features';
import { ExceptionHandler } from './types/ExceptionRoute';
import { Feature } from './types/Feature';
import {
    OakCommonComponentMethods,
    OakComponentOption,
    OakPageMethods,
    OakPageOption,
} from './types/Page';
import {
    ComponentThisType,
    makeHiddenComponentMethods,
    makeListComponentMethods,
    makeCommonComponentMethods as makeCommon,
    makePageMethods as makePage,
} from './page.common';
import assert from 'assert';

function makeCommonComponentMethods<
    ED extends EntityDict,
    T extends keyof ED,
    Cxt extends Context<ED>,
    AD extends Record<string, Aspect<ED, Cxt>>,
    FD extends Record<string, Feature<ED, Cxt, AD & CommonAspectDict<ED, Cxt>>>,
    FormedData extends WechatMiniprogram.Component.DataOption,
    Proj extends ED[T]['Selection']['data'],
    IsList extends boolean,
    TData extends WechatMiniprogram.Component.DataOption = {},
    TProperty extends WechatMiniprogram.Component.PropertyOption = {},
    TMethod extends WechatMiniprogram.Component.MethodOption = {}
>(
    features: BasicFeatures<ED, Cxt, AD & CommonAspectDict<ED, Cxt>> & FD,
    exceptionRouterDict: Record<string, ExceptionHandler>,
    formData: OakPageOption<
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
    >['formData']
): OakCommonComponentMethods<ED, T> &
    ComponentThisType<ED, T, FormedData, IsList, TData, TProperty, TMethod> {
    return {
        resolveInput(input: WechatMiniprogram.CustomEvent, keys) {
            const { currentTarget, detail } = input;
            const { dataset } = currentTarget;
            const { value } = detail;
            const result = {
                dataset,
                value,
            };
            if (keys) {
                keys.forEach((k) =>
                    assign(result, {
                        [k]: detail[k],
                    })
                );
            }
            return result;
        },
        navigateBack(option) {
            return new Promise((resolve, reject) => {
                wx.navigateBack(
                    assign({}, option, {
                        success() {
                            resolve(undefined);
                        },
                        fail(err: any) {
                            reject(err);
                        },
                    })
                );
            });
        },
        navigateTo(options) {
            const { url, events, fail, complete, success, ...rest } = options;

            const urlParse = URL.parse(url, true);
            const { pathname, search } = urlParse as {
                pathname: string;
                search: string;
            };
            if (!/^\/{1}/.test(pathname)) {
                assert(false, 'url前面必须以/开头');
            }
            // 格式:/house/list 前面加上/pages 后面加上/index
            if (
                pathname?.indexOf('pages') !== -1 ||
                pathname?.lastIndexOf('index') !== -1
            ) {
                assert(false, 'url两边不需要加上/pages和/index');
            }
            const pathname2 = `/pages${pathname}/index`;
            let search2 = search || '';
            search2 = search2.includes('?')
                ? search2.concat(`&oakFrom=${this.state.oakFullpath}`)
                : search2.concat(`?oakFrom=${this.state.oakFullpath}`);

            for (const param in rest) {
                const param2 = param as unknown as keyof typeof rest;
                search2 += `&${param}=${
                    typeof rest[param2] === 'string'
                        ? rest[param2]
                        : JSON.stringify(rest[param2])
                }`;
            }
            const url2 = URL.format({
                pathname: pathname2,
                search: search2,
            });
            assign(options, {
                url: url2,
            });
            return new Promise((resolve, reject) => {
                wx.navigateTo(
                    assign({}, options, {
                        success(res: any) {
                            success && success(res);
                            resolve(undefined);
                        },
                        fail(err: any) {
                            fail && fail(err);
                            reject(err);
                        },
                    })
                );
            });
        },
        redirectTo(options) {
            const { url, events, fail, complete, success, ...rest } = options;
            const urlParse = URL.parse(url, true);
            const { pathname, search } = urlParse as {
                pathname: string;
                search: string;
            };
            if (/^\//.test(pathname)) {
                assert(false, 'url前面必须以/开头');
            }
            if (
                pathname!.indexOf('pages') !== -1 ||
                pathname!.lastIndexOf('index') !== -1
            ) {
                assert(false, 'url两边不需要加上/pages和/index');
            }
            // 格式:/house/list 前面加上/pages 后面加上/index
            const pathname2 = `/pages${pathname}/index`;
            let search2 = search || '';
            search2 = search2.includes('?')
                ? search2.concat(`&oakFrom=${this.state.oakFullpath}`)
                : search2.concat(`?oakFrom=${this.state.oakFullpath}`);

            for (const param in rest) {
                const param2 = param as unknown as keyof typeof rest;
                search2 += `&${param}=${
                    typeof rest[param2] === 'string'
                        ? rest[param2]
                        : JSON.stringify(rest[param2])
                }`;
            }
            const url2 = URL.format({
                pathname: pathname2,
                search: search2,
            });
            assign(options, {
                url: url2,
            });
            return new Promise((resolve, reject) => {
                wx.redirectTo(
                    assign({}, options, {
                        success(res: any) {
                            success && success(res);
                            resolve(undefined);
                        },
                        fail(err: any) {
                            fail && fail(err);
                            reject(err);
                        },
                    })
                );
            });
        },

        ...makeCommon(features, exceptionRouterDict, formData),
    };
}

function makePageMethods<
    ED extends EntityDict,
    T extends keyof ED,
    Cxt extends Context<ED>,
    AD extends Record<string, Aspect<ED, Cxt>>,
    FD extends Record<string, Feature<ED, Cxt, AD & CommonAspectDict<ED, Cxt>>>,
    FormedData extends WechatMiniprogram.Component.DataOption,
    Proj extends ED[T]['Selection']['data'],
    IsList extends boolean,
    TData extends WechatMiniprogram.Component.DataOption = {},
    TProperty extends WechatMiniprogram.Component.PropertyOption = {},
    TMethod extends WechatMiniprogram.Component.MethodOption = {}
>(
    features: BasicFeatures<ED, Cxt, AD & CommonAspectDict<ED, Cxt>> & FD,
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
): OakPageMethods &
    ComponentThisType<ED, T, FormedData, IsList, TData, TProperty, TMethod> {
    const { onPullDownRefresh, onLoad, ...rest } = makePage(features, options);
    return {
        async onPullDownRefresh() {
            await onPullDownRefresh.call(this);
            if (!this.state.oakLoading) {
                await wx.stopPullDownRefresh();
            }
        },
        async onLoad(pageOption) {
            await onLoad.call(this, pageOption);
            // 处理传递参数的格式化，小程序的缺陷只能用string传递参数
            const data = {};
            if (options.properties) {
                for (const key in options.properties) {
                    // Number和Boolean类型小程序框架能自动处理吗？实测中再改
                    if (typeof pageOption[key] === 'string' && options.properties[key] !== String) {
                        assign(data, {
                            [key]: JSON.parse(pageOption[key]!),
                        });
                    }
                }
                if (Object.keys(data).length > 0) {
                    await this.setState(data);
                }
            }
        },
        ...rest,
    };
}

export function createPage<
    ED extends EntityDict,
    T extends keyof ED,
    Cxt extends Context<ED>,
    AD extends Record<string, Aspect<ED, Cxt>>,
    FD extends Record<string, Feature<ED, Cxt, AD & CommonAspectDict<ED, Cxt>>>,
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
    >,
    features: BasicFeatures<ED, Cxt, AD & CommonAspectDict<ED, Cxt>> & FD,
    exceptionRouterDict: Record<string, ExceptionHandler>,
    context: Cxt
) {
    const { formData, isList } = options;
    const hiddenMethods = makeHiddenComponentMethods();
    const commonMethods = makeCommonComponentMethods(
        features,
        exceptionRouterDict,
        formData
    );
    const listMethods = isList ? makeListComponentMethods(features) : {};
    const { onLoad, onPullDownRefresh, onReachBottom, ...restPageMethods } =
        makePageMethods(features, options);

    const { methods, lifetimes, pageLifetimes } = options;
    return Component({
        data: assign({}, options.data, {
            oakFullpath: '',
        }),
        properties: assign({}, options.properties, {
            oakEntity: String,
            oakId: String,
            oakPath: String,
            oakParent: String,
            oakProjection: String,
            oakFilters: String,
            oakSorters: String,
            oakIsPicker: Boolean,
            oakParentEntity: String,
            oakFrom: String,
            oakActions: String,
            newOakActions: Array,
        }),
        methods: {
            setState(data: any, callback?: () => void) {
                this.setData(data, () => {
                    (this as any).state = this.data;
                    (this as any).props = this.data;
                    callback && callback.call(this);
                });
            },
            async onLoad(pageOption: Record<string, string | undefined>) {
                (this as any).props = this.data;
                await onLoad.call(this, pageOption);
                methods?.onLoad && methods?.onLoad.call(this, pageOption);
            },
            async onPullDownRefresh() {
                await onPullDownRefresh.call(this);
                methods?.onPullDownRefresh &&
                    methods?.onPullDownRefresh.call(this);
            },
            async onReachBottom() {
                await onReachBottom.call(this);
                methods?.onReachBottom && methods?.onReachBottom.call(this);
            },
            ...hiddenMethods,
            ...commonMethods,
            ...listMethods,
            ...restPageMethods,
            ...(methods
                ? omit(methods, [
                      'onLoad',
                      'onPullDownRefresh',
                      'onReachBottom',
                  ])
                : {}),
        },
        lifetimes: {
            created() {
                const { setData } = this;
                (this as any).state = this.data;
                (this as any).props = this.data;
                (this as any).features = features;
                this.setData = (data, callback) => {
                    setData.call(this, data, () => {
                        (this as any).state = this.data;
                        (this as any).props = this.data;
                        callback && callback.call(this);
                    });
                };
                context.setScene(options.path);
                lifetimes?.created && lifetimes.created.call(this);
            },

            attached() {
                this.subscribe();
                /* const i18nInstance = getI18nInstanceWechatMp();
                if (i18nInstance) {
                    (this as any).setData({
                        [CURRENT_LOCALE_KEY]: i18nInstance.currentLocale,
                        [CURRENT_LOCALE_DATA]: i18nInstance.translations,
                    });
                } */
                lifetimes?.attached && lifetimes.attached.call(this);
            },

            ready() {
                lifetimes?.ready && lifetimes.ready.call(this);
            },

            detached() {
                features.runningTree.destroyNode(this.data.oakFullpath);
                this.unsubscribe();
                lifetimes?.detached && lifetimes.detached.call(this);
            },

            error(err: Error) {
                console.error(err);
                lifetimes?.error && lifetimes.error.call(this, err);
            },

            moved() {
                lifetimes?.moved && lifetimes.moved.call(this);
            },
        },

        pageLifetimes: {
            show() {
                context.setScene(options.path);
                this.reRender();
                this.subscribe();
                pageLifetimes?.show && pageLifetimes.show.call(this);
            },
            hide() {
                this.unsubscribe();
                pageLifetimes?.hide && pageLifetimes.hide.call(this);
            },
            resize(size) {
                pageLifetimes?.resize && pageLifetimes.resize.call(this, size);
            },
        },
    });
}

export function createComponent<
    ED extends EntityDict,
    T extends keyof ED,
    Cxt extends Context<ED>,
    AD extends Record<string, Aspect<ED, Cxt>>,
    FD extends Record<string, Feature<ED, Cxt, AD & CommonAspectDict<ED, Cxt>>>,
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
    >,
    features: BasicFeatures<ED, Cxt, AD & CommonAspectDict<ED, Cxt>> & FD,
    exceptionRouterDict: Record<string, ExceptionHandler>,
    context: Cxt
) {
    const {
        formData,
        isList,
        entity,
        methods,
        lifetimes,
        pageLifetimes,
        data,
        properties,
        actions,
        observers,
        ...restOptions
    } = options;
    const hiddenMethods = makeHiddenComponentMethods();
    const commonMethods = makeCommonComponentMethods(
        features,
        exceptionRouterDict,
        formData
    );
    const listMethods = isList ? makeListComponentMethods(features) : {};

    return Component({
        data: assign({}, data, {
            oakEntity: '',
            oakFullpath: '',
        }),
        properties: assign({}, properties, {
            oakEntity: String,
            oakPath: String,
            oakParent: String,
        }),
        observers: {
            oakPath: function (path) {
                return this.onPropsChanged({
                    path,
                });
            },
            oakParent: function (parent) {
                return this.onPropsChanged({
                    parent,
                });
            },
            ...observers,
        },
        methods: {
            setState(data: any, callback?: () => void) {
                this.setData(data, () => {
                    (this as any).state = this.data;
                    (this as any).props = this.data;
                    callback && callback();
                });
            },
            async onPropsChanged(options: { path?: string; parent?: string }) {
                const path2 = options.hasOwnProperty('path')
                    ? options.path!
                    : this.data.oakPath;
                const parent2 = options.hasOwnProperty('parent')
                    ? options.parent!
                    : this.data.oakParent;
                if (path2 && parent2) {
                    const oakFullpath2 = `${parent2}.${path2}`;
                    if (oakFullpath2 !== this.data.oakFullpath) {
                        this.setState({
                            oakFullpath: oakFullpath2,
                            oakEntity: entity as string,
                        });
                        this.reRender();
                    }
                }
            },
            ...hiddenMethods,
            ...commonMethods,
            ...listMethods,
            ...methods,
        },

        lifetimes: {
            async created() {
                (this as any).state = this.data;
                (this as any).props = this.data;
                (this as any).features = features;
                const { setData } = this;
                this.setData = (data, callback) => {
                    setData.call(this, data, () => {
                        (this as any).state = this.data;
                        (this as any).props = this.data;
                        callback && callback.call(this);
                    });
                };
                lifetimes?.created && lifetimes.created.call(this);
            },

            async ready() {
                const { oakPath, oakParent } = this.data;
                if (oakParent && oakPath) {
                    const oakFullpath = `${oakParent}.${oakPath}`;
                    this.setState({
                        oakFullpath,
                        oakEntity: entity,
                    });
                    this.reRender();
                }
                lifetimes?.ready && lifetimes.ready.call(this);
            },

            async attached() {
                this.subscribe();
                /* const i18nInstance = getI18nInstanceWechatMp();
                if (i18nInstance) {
                    (this as any).setData({
                        [CURRENT_LOCALE_KEY]: i18nInstance.currentLocale,
                        [CURRENT_LOCALE_DATA]: i18nInstance.translations,
                    });
                } */
                lifetimes?.attached && lifetimes.attached.call(this);
            },

            async detached() {
                this.unsubscribe();
                lifetimes?.detached && lifetimes.detached.call(this);
            },

            error(err: Error) {
                lifetimes?.error && lifetimes.error.call(this, err);
            },

            moved() {
                lifetimes?.moved && lifetimes.moved.call(this);
            },
        },

        pageLifetimes: {
            show() {
                this.reRender();
                this.subscribe();
                pageLifetimes?.show && pageLifetimes.show.call(this);
            },
            hide() {
                this.unsubscribe();
                pageLifetimes?.hide && pageLifetimes.hide.call(this);
            },
            resize(size) {
                pageLifetimes?.resize && pageLifetimes.resize.call(this, size);
            },
        },

        ...restOptions,
    });
}

export type MakeOakPage<
    ED extends EntityDict,
    Cxt extends Context<ED>,
    AD extends Record<string, Aspect<ED, Cxt>>,
    FD extends Record<string, Feature<ED, Cxt, AD & CommonAspectDict<ED, Cxt>>>
> = <
    T extends keyof ED,
    Proj extends ED[T]['Selection']['data'],
    FormedData extends WechatMiniprogram.Component.DataOption,
    IsList extends boolean,
    TData extends WechatMiniprogram.Component.DataOption,
    TProperty extends WechatMiniprogram.Component.PropertyOption,
    TMethod extends WechatMiniprogram.Component.MethodOption
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
) => string;

export type MakeOakComponent<
    ED extends EntityDict,
    Cxt extends Context<ED>,
    AD extends Record<string, Aspect<ED, Cxt>>,
    FD extends Record<string, Feature<ED, Cxt, AD & CommonAspectDict<ED, Cxt>>>
> = <
    T extends keyof ED,
    FormedData extends WechatMiniprogram.Component.DataOption,
    IsList extends boolean,
    TData extends WechatMiniprogram.Component.DataOption,
    TProperty extends WechatMiniprogram.Component.PropertyOption,
    TMethod extends WechatMiniprogram.Component.MethodOption
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
) => string;
