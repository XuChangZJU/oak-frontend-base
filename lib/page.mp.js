"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createComponent = exports.createPage = void 0;
const lodash_1 = require("lodash");
const page_common_1 = require("./page.common");
function makeCommonComponentMethods(features, exceptionRouterDict, formData) {
    return {
        resolveInput: (input, keys) => {
            const { target, detail } = input;
            const { dataset } = target;
            const { value } = detail;
            const result = {
                dataset,
                value,
            };
            if (keys) {
                keys.forEach((k) => (0, lodash_1.assign)(result, {
                    [k]: detail[k]
                }));
            }
            return result;
        },
        navigateBack: (option) => wx.navigateBack(option),
        navigateTo(options) {
            const { url, events, fail, complete, success, ...rest } = options;
            let url2 = url.includes('?') ? url.concat(`&oakFrom=${this.state.oakFullpath}`) : url.concat(`?oakFrom=${this.state.oakFullpath}`);
            for (const param in rest) {
                const param2 = param;
                url2 += `&${param}=${typeof rest[param2] === 'string' ? rest[param2] : JSON.stringify(rest[param2])}`;
            }
            (0, lodash_1.assign)(options, {
                url: url2
            });
            return wx.navigateTo(options);
        },
        ...(0, page_common_1.makeCommonComponentMethods)(features, exceptionRouterDict, formData),
    };
}
function makePageMethods(features, options) {
    const { onPullDownRefresh, ...rest } = (0, page_common_1.makePageMethods)(features, options);
    return {
        async onPullDownRefresh() {
            await onPullDownRefresh();
            if (!this.state.oakLoading) {
                await wx.stopPullDownRefresh();
            }
        },
        ...rest,
    };
}
function createPage(options, features, exceptionRouterDict, context) {
    const { formData, isList } = options;
    const hiddenMethods = (0, page_common_1.makeHiddenComponentMethods)();
    const commonMethods = makeCommonComponentMethods(features, exceptionRouterDict, formData);
    const listMethods = isList ? (0, page_common_1.makeListComponentMethods)(features) : {};
    const { onLoad, onPullDownRefresh, onReachBottom, ...restPageMethods } = makePageMethods(features, options);
    const { methods, lifetimes, pageLifetimes } = options;
    return Component({
        data: (0, lodash_1.assign)({}, options.data, {
            oakFullpath: '',
        }),
        properties: (0, lodash_1.assign)({}, options.properties, {
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
            setState(data, callback) {
                this.setData(data, () => {
                    this.state = this.data;
                    this.props = this.data;
                    callback && callback();
                });
            },
            async onLoad(pageOption) {
                this.props = this.data;
                await onLoad(pageOption);
                methods?.onLoad && methods?.onLoad(pageOption);
            },
            async onPullDownRefresh() {
                await onPullDownRefresh();
                methods?.onPullDownRefresh && methods?.onPullDownRefresh();
            },
            async onReachBottom() {
                await onReachBottom();
                methods?.onReachBottom && methods?.onReachBottom();
            },
            ...hiddenMethods,
            ...commonMethods,
            ...listMethods,
            ...restPageMethods,
            ...(methods ? (0, lodash_1.omit)(methods, ['onLoad', 'onPullDownRefresh', 'onReachBottom']) : {}),
        },
        lifetimes: {
            created() {
                const { setData } = this;
                this.features = features;
                this.setData = (data, callback) => {
                    setData.call(this, data, () => {
                        this.state = this.data;
                        this.props = this.data;
                        callback && callback();
                    });
                };
                context.setScene(options.path);
                lifetimes?.created && lifetimes.created();
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
                lifetimes?.attached && lifetimes.attached();
            },
            ready() {
                lifetimes?.ready && lifetimes.ready();
            },
            detached() {
                features.runningTree.destroyNode(this.data.oakFullpath);
                this.unsubscribe();
                lifetimes?.detached && lifetimes.detached();
            },
            error(err) {
                lifetimes?.error && lifetimes.error(err);
            },
            moved() {
                lifetimes?.moved && lifetimes.moved();
            }
        },
        pageLifetimes: {
            show() {
                context.setScene(options.path);
                this.reRender();
                this.subscribe();
                pageLifetimes?.show && pageLifetimes.show();
            },
            hide() {
                this.unsubscribe();
                pageLifetimes?.hide && pageLifetimes.hide();
            },
            resize(size) {
                pageLifetimes?.resize && pageLifetimes.resize(size);
            }
        },
    });
}
exports.createPage = createPage;
function createComponent(options, features, exceptionRouterDict, context) {
    const { formData, isList, entity, methods, lifetimes, pageLifetimes, data, properties, actions, observers, ...restOptions } = options;
    const hiddenMethods = (0, page_common_1.makeHiddenComponentMethods)();
    const commonMethods = makeCommonComponentMethods(features, exceptionRouterDict, formData);
    const listMethods = isList ? (0, page_common_1.makeListComponentMethods)(features) : {};
    return Component({
        data: (0, lodash_1.assign)({}, data, {
            oakEntity: '',
            oakFullpath: '',
        }),
        properties: (0, lodash_1.assign)({}, properties, {
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
            setState(data, callback) {
                this.setData(data, () => {
                    this.state = this.data;
                    this.props = this.data;
                    callback && callback();
                });
            },
            async onPropsChanged(options) {
                const path2 = options.hasOwnProperty('path')
                    ? options.path
                    : this.data.oakPath;
                const parent2 = options.hasOwnProperty('parent')
                    ? options.parent
                    : this.data.oakParent;
                if (path2 && parent2) {
                    const oakFullpath2 = `${parent2}.${path2}`;
                    if (oakFullpath2 !== this.data.oakFullpath) {
                        this.setState({
                            oakFullpath: oakFullpath2,
                            oakEntity: entity,
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
                this.features = features;
                const { setData } = this;
                this.setData = (data, callback) => {
                    setData.call(this, data, () => {
                        this.state = this.data;
                        this.props = this.data;
                        callback && callback();
                    });
                };
                lifetimes?.created && lifetimes.created();
            },
            async ready() {
                this.props = this.data;
                const { oakPath, oakParent } = this.data;
                if (oakParent && oakPath) {
                    const oakFullpath = `${oakParent}.${oakPath}`;
                    this.setState({
                        oakFullpath,
                        oakEntity: entity,
                    });
                    this.reRender();
                }
                lifetimes?.ready && lifetimes.ready();
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
                lifetimes?.attached && lifetimes.attached();
            },
            async detached() {
                this.unsubscribe();
                lifetimes?.detached && lifetimes.detached();
            },
            error(err) {
                lifetimes?.error && lifetimes.error(err);
            },
            moved() {
                lifetimes?.moved && lifetimes.moved();
            }
        },
        pageLifetimes: {
            show() {
                this.reRender();
                this.subscribe();
                pageLifetimes?.show && pageLifetimes.show();
            },
            hide() {
                this.unsubscribe();
                pageLifetimes?.hide && pageLifetimes.hide();
            },
            resize(size) {
                pageLifetimes?.resize && pageLifetimes.resize(size);
            }
        },
        ...restOptions,
    });
}
exports.createComponent = createComponent;
