"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createComponent = exports.createPage = void 0;
const lodash_1 = require("lodash");
const url_1 = __importDefault(require("url"));
const assert_1 = __importDefault(require("assert"));
const page_common_1 = require("./page.common");
const i18n_1 = require("./platforms/wechatMp/i18n");
function makeCommonComponentMethods(features, exceptionRouterDict, formData) {
    return {
        resolveInput(input, keys) {
            const { currentTarget, detail } = input;
            const { dataset } = currentTarget;
            const { value } = detail;
            const result = {
                dataset,
                value,
            };
            if (keys) {
                keys.forEach((k) => (0, lodash_1.assign)(result, {
                    [k]: detail[k],
                }));
            }
            return result;
        },
        navigateBack(option) {
            return new Promise((resolve, reject) => {
                wx.navigateBack((0, lodash_1.assign)({}, option, {
                    success() {
                        resolve(undefined);
                    },
                    fail(err) {
                        reject(err);
                    },
                }));
            });
        },
        navigateTo(options) {
            const { url, events, fail, complete, success, ...rest } = options;
            const urlParse = url_1.default.parse(url, true);
            const { pathname, search } = urlParse;
            if (!/^\/{1}/.test(pathname)) {
                (0, assert_1.default)(false, 'url前面必须以/开头');
            }
            // 格式:/house/list 前面加上/pages 后面加上/index
            if (pathname?.indexOf('pages') !== -1 ||
                pathname?.lastIndexOf('index') !== -1) {
                (0, assert_1.default)(false, 'url两边不需要加上/pages和/index');
            }
            const pathname2 = `/pages${pathname}/index`;
            let search2 = search || '';
            search2 = search2.includes('?')
                ? search2.concat(`&oakFrom=${this.state.oakFullpath}`)
                : search2.concat(`?oakFrom=${this.state.oakFullpath}`);
            for (const param in rest) {
                const param2 = param;
                search2 += `&${param}=${typeof rest[param2] === 'string'
                    ? rest[param2]
                    : JSON.stringify(rest[param2])}`;
            }
            const url2 = url_1.default.format({
                pathname: pathname2,
                search: search2,
            });
            (0, lodash_1.assign)(options, {
                url: url2,
            });
            return new Promise((resolve, reject) => {
                wx.navigateTo((0, lodash_1.assign)({}, options, {
                    success(res) {
                        success && success(res);
                        resolve(undefined);
                    },
                    fail(err) {
                        fail && fail(err);
                        reject(err);
                    },
                }));
            });
        },
        redirectTo(options) {
            const { url, events, fail, complete, success, ...rest } = options;
            const urlParse = url_1.default.parse(url, true);
            const { pathname, search } = urlParse;
            if (/^\//.test(pathname)) {
                (0, assert_1.default)(false, 'url前面必须以/开头');
            }
            if (pathname.indexOf('pages') !== -1 ||
                pathname.lastIndexOf('index') !== -1) {
                (0, assert_1.default)(false, 'url两边不需要加上/pages和/index');
            }
            // 格式:/house/list 前面加上/pages 后面加上/index
            const pathname2 = `/pages${pathname}/index`;
            let search2 = search || '';
            search2 = search2.includes('?')
                ? search2.concat(`&oakFrom=${this.state.oakFullpath}`)
                : search2.concat(`?oakFrom=${this.state.oakFullpath}`);
            for (const param in rest) {
                const param2 = param;
                search2 += `&${param}=${typeof rest[param2] === 'string'
                    ? rest[param2]
                    : JSON.stringify(rest[param2])}`;
            }
            const url2 = url_1.default.format({
                pathname: pathname2,
                search: search2,
            });
            (0, lodash_1.assign)(options, {
                url: url2,
            });
            return new Promise((resolve, reject) => {
                wx.redirectTo((0, lodash_1.assign)({}, options, {
                    success(res) {
                        success && success(res);
                        resolve(undefined);
                    },
                    fail(err) {
                        fail && fail(err);
                        reject(err);
                    },
                }));
            });
        },
        ...(0, page_common_1.makeCommonComponentMethods)(features, exceptionRouterDict, formData),
    };
}
function makePageMethods(features, options) {
    const { onPullDownRefresh, onLoad, ...rest } = (0, page_common_1.makePageMethods)(features, options);
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
                        (0, lodash_1.assign)(data, {
                            [key]: JSON.parse(pageOption[key]),
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
                    callback && callback.call(this);
                });
            },
            async onLoad(pageOption) {
                this.props = this.data;
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
                ? (0, lodash_1.omit)(methods, [
                    'onLoad',
                    'onPullDownRefresh',
                    'onReachBottom',
                ])
                : {}),
        },
        lifetimes: {
            created() {
                const { setData } = this;
                this.state = this.data;
                this.props = this.data;
                this.features = features;
                this.setData = (data, callback) => {
                    setData.call(this, data, () => {
                        this.state = this.data;
                        this.props = this.data;
                        callback && callback.call(this);
                    });
                };
                context.setScene(options.path);
                lifetimes?.created && lifetimes.created.call(this);
            },
            attached() {
                this.subscribe();
                const i18nInstance = (0, i18n_1.getI18nInstanceWechatMp)();
                if (i18nInstance) {
                    this.setState({
                        [i18n_1.CURRENT_LOCALE_KEY]: i18nInstance.currentLocale,
                        [i18n_1.CURRENT_LOCALE_DATA]: i18nInstance.translations,
                    });
                }
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
            error(err) {
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
                this.state = this.data;
                this.props = this.data;
                this.features = features;
                const { setData } = this;
                this.setData = (data, callback) => {
                    setData.call(this, data, () => {
                        this.state = this.data;
                        this.props = this.data;
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
                const i18nInstance = (0, i18n_1.getI18nInstanceWechatMp)();
                if (i18nInstance) {
                    this.setState({
                        [i18n_1.CURRENT_LOCALE_KEY]: i18nInstance.currentLocale,
                        [i18n_1.CURRENT_LOCALE_DATA]: i18nInstance.translations,
                    });
                }
                lifetimes?.attached && lifetimes.attached.call(this);
            },
            async detached() {
                this.unsubscribe();
                lifetimes?.detached && lifetimes.detached.call(this);
            },
            error(err) {
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
exports.createComponent = createComponent;
