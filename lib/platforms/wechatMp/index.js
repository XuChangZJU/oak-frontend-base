"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initialize = void 0;
require("./polyfill");
const types_1 = require("oak-domain/lib/types");
const initialize_1 = require("../../initialize");
const assert_1 = __importDefault(require("assert"));
const lodash_1 = require("lodash");
;
function setUpdateData(features, fullpath, input) {
    const { target, detail } = input;
    const { dataset: { path } } = target;
    const { value } = detail;
    features.runningNode.setUpdateData(fullpath, path, value);
}
function setFilters(features, fullpath, filters) {
    features.runningNode.setFilters(fullpath, filters);
}
async function execute(features, fullpath, action, isTry) {
    try {
        await features.runningNode.execute(fullpath, action, isTry);
    }
    catch (err) {
        const { message } = err;
        wx.showToast({
            title: message,
            icon: 'error'
        });
        throw err;
    }
}
function callPicker(features, touch, entity, parent) {
    const { currentTarget: { dataset } } = touch;
    const { path, ...rest } = dataset;
    const relation = features.cache.judgeRelation(entity, path);
    let subEntity;
    if (relation === 2) {
        subEntity = path;
    }
    else {
        (0, assert_1.default)(typeof relation === 'string');
        subEntity = relation;
    }
    let url = `/pages/pickers/${subEntity}/index?oakIsPicker=true&oakParentEntity=${entity}&oakParent=${parent}&oakPath=${path}`;
    for (const k in rest) {
        url += `&${k}=${JSON.stringify(rest[k])}`;
    }
    wx.navigateTo({
        url,
    });
}
function createPageOptions(options, doSubscribe, features) {
    const { formData, isList, pagination } = options;
    const componentOptions = {
        properties: {
            oakEntity: String,
            oakId: String,
            oakPath: String,
            oakParent: String,
            oakProjection: Object,
            oakFilters: Array,
            oakSorter: Array,
            oakIsPicker: Boolean,
            oakParentEntity: String,
            oakFrom: String,
        },
        methods: {
            async reRender() {
                const $rows = await features.runningNode.get(this.data.oakFullpath);
                const data = formData($rows, features);
                for (const k in data) {
                    if (data[k] === undefined) {
                        (0, lodash_1.assign)(data, {
                            [k]: null,
                        });
                    }
                }
                const dirty = await features.runningNode.isDirty(this.data.oakFullpath);
                this.setData((0, lodash_1.assign)({}, data, { oakDirty: dirty }));
            },
            async refresh() {
                await features.runningNode.refresh(this.data.oakFullpath);
            },
            async onPullDownRefresh() {
                console.log('onPullDownRefresh');
                await this.refresh();
            },
            subscribe() {
                if (!this.subscribed) {
                    this.subscribed = doSubscribe(() => this.reRender());
                }
            },
            unsubscribe() {
                if (this.subscribed) {
                    this.subscribed();
                    this.subscribed = undefined;
                }
            },
            setUpdateData(input) {
                if (this.data.oakExecuting) {
                    return;
                }
                setUpdateData(features, this.data.oakFullpath, input);
            },
            callPicker(touch) {
                if (this.data.oakExecuting) {
                    return;
                }
                callPicker(features, touch, options.entity, this.data.oakFullpath);
            },
            async setForeignKey(id, goBackDelta = -1) {
                if (this.data.oakExecuting) {
                    return;
                }
                const { oakParentEntity, oakPath, oakIsPicker, oakFullpath } = this.data;
                if (oakIsPicker) {
                    const relation = features.cache.judgeRelation(oakParentEntity, oakPath);
                    const parentPath = oakFullpath.slice(0, oakFullpath.lastIndexOf('.'));
                    if (relation === 2) {
                        await features.runningNode.setMultipleData(parentPath, [['entity', oakPath], ['entityId', id]]);
                    }
                    else {
                        (0, assert_1.default)(typeof relation === 'string');
                        await features.runningNode.setUpdateData(parentPath, `${oakPath}Id`, id);
                    }
                    if (goBackDelta !== 0) {
                        wx.navigateBack({
                            delta: goBackDelta,
                        });
                    }
                }
            },
            onForeignKeyPicked(input) {
                const { id } = input.currentTarget.dataset;
                this.setForeignKey(id);
            },
            setFilters(filters) {
                if (this.data.oakExecuting) {
                    return;
                }
                setFilters(features, this.data.oakFullpath, filters);
            },
            async execute(touch) {
                if (this.data.oakExecuting) {
                    return;
                }
                const { action, then } = touch.currentTarget.dataset;
                this.setData({
                    oakExecuting: true,
                    oakFocused: {},
                });
                try {
                    await execute(features, this.data.oakFullpath, action);
                    this.setData({ oakExecuting: false });
                    if (then) {
                        this[then]();
                    }
                }
                catch (err) {
                    if (err instanceof types_1.AttrIllegalError) {
                        const attr = err.getAttributes()[0];
                        this.setData({
                            oakFocused: {
                                [attr]: 'focused',
                            },
                            oakExecuting: false,
                        });
                    }
                    else {
                        this.setData({
                            oakExecuting: false,
                        });
                    }
                }
            },
            navigateTo(options) {
                const { url } = options;
                const url2 = url.includes('?') ? url.concat(`&oakFrom=${this.data.oakFullpath}`) : url.concat(`?oakFrom=${this.data.oakFullpath}`);
                (0, lodash_1.assign)(options, {
                    url: url2
                });
                return wx.navigateTo(options);
            }
        },
        lifetimes: {
            async created() {
                this.features = features;
            },
            async attached() {
                this.subscribe();
            },
            async ready() {
                const { oakId, oakEntity, oakPath, oakProjection, oakParent, oakSorter, oakFilters, oakIsPicker, oakFrom } = this.data;
                (0, assert_1.default)(!(isList && oakId));
                let filters;
                if (oakFilters.length > 0) {
                    filters = oakFilters;
                }
                else if (options.filters) {
                    filters = options.filters;
                }
                await features.runningNode.createNode(oakPath || options.path, oakParent, (oakEntity || options.entity), isList, oakIsPicker, (oakProjection || options.projection), oakId, pagination, filters, oakSorter);
                const oakFullpath = oakParent ? `${oakParent}.${oakPath || options.path}` : oakPath || options.path;
                this.data.oakFullpath = oakFullpath;
                this.data.oakFrom = oakFrom;
                await this.refresh();
            },
            async detached() {
                console.log('page detached');
                await features.runningNode.destroyNode(this.data.oakFullpath);
                this.unsubscribe();
                // await context.rollback();
            },
        },
        pageLifetimes: {
            show() {
                // this.subscribe();
            },
            hide() {
                // this.unsubscribe();
            }
        },
    };
    return componentOptions;
}
function createComponentOptions(options, doSubscribe, features) {
    const { formData } = options;
    const componentOptions = {
        properties: {
            oakValue: Object,
            oakEntity: String,
            oakPath: String,
            oakParent: String,
        },
        observers: {
            "oakValue": async function (value) {
                const $rows = value instanceof Array ? value : [value];
                const data = formData($rows, features);
                for (const k in data) {
                    if (data[k] === undefined) {
                        (0, lodash_1.assign)(data, {
                            [k]: null,
                        });
                    }
                }
                const dirty = await features.runningNode.isDirty(this.data.oakFullpath);
                this.setData((0, lodash_1.assign)({}, data, {
                    oakDirty: dirty,
                }));
            },
            "oakParent": async function (oakParent) {
                if (oakParent) {
                    const oakFullpath = `${oakParent}.${this.data.oakPath}`;
                    const entity = await features.runningNode.createNode(this.data.oakPath, oakParent);
                    this.setData({
                        oakFullpath,
                        entity,
                    });
                }
            }
        },
        methods: {
            setUpdateData(input) {
                if (this.data.oakExecuting) {
                    return;
                }
                setUpdateData(features, this.data.oakFullpath, input);
            },
            callPicker(touch) {
                if (this.data.oakExecuting) {
                    return;
                }
                callPicker(features, touch, this.data.entity, this.data.oakFullpath);
            },
            setFilters(filters) {
                if (this.data.oakExecuting) {
                    return;
                }
                setFilters(features, this.data.oakFullpath, filters);
            },
            async execute(touch) {
                if (this.data.oakExecuting) {
                    return;
                }
                const { action } = touch.currentTarget.dataset;
                this.setData({
                    oakExecuting: true,
                    oakFocused: {},
                });
                try {
                    await execute(features, this.data.oakFullpath, action);
                    this.setData({ oakExecuting: false });
                }
                catch (err) {
                    if (err instanceof types_1.AttrIllegalError) {
                        const attr = err.getAttributes()[0];
                        this.setData({
                            oakFocused: {
                                [attr]: 'focused',
                            },
                            oakExecuting: false,
                        });
                    }
                    else {
                        this.setData({
                            oakExecuting: false,
                        });
                    }
                }
            },
            navigateTo(options) {
                const { url } = options;
                const url2 = url.includes('?') ? url.concat(`&oakFrom=${this.data.oakFullpath}`) : url.concat(`?oakFrom=${this.data.oakFullpath}`);
                (0, lodash_1.assign)(options, {
                    url: url2
                });
                return wx.navigateTo(options);
            }
        },
        lifetimes: {
            async created() {
                this.features = features;
            },
            async ready() {
                const { oakPath, oakParent, oakValue } = this.data;
                const $rows = oakValue instanceof Array ? oakValue : [oakValue];
                const data = formData($rows, features);
                for (const k in data) {
                    if (data[k] === undefined) {
                        (0, lodash_1.assign)(data, {
                            [k]: null,
                        });
                    }
                }
                if (oakParent) {
                    // 小程序component ready的时候，父组件还未构造完成
                    const oakFullpath = `${oakParent}.${oakPath}`;
                    const entity = await features.runningNode.createNode(oakPath, oakParent);
                    this.setData((0, lodash_1.assign)(data, {
                        oakFullpath,
                        entity,
                    }));
                }
                else {
                    this.setData(data);
                }
            },
            async detached() {
                console.log('component detached');
                await features.runningNode.destroyNode(this.data.oakFullpath);
            }
        },
    };
    return componentOptions;
}
function mergeLifetimes(lifetimes) {
    return {
        async created() {
            for (const ele of lifetimes) {
                if (ele.created) {
                    await ele.created.call(this);
                }
            }
        },
        async attached() {
            for (const ele of lifetimes) {
                if (ele.attached) {
                    await ele.attached.call(this);
                }
            }
        },
        async detached() {
            for (const ele of lifetimes) {
                if (ele.detached) {
                    await ele.detached.call(this);
                }
            }
        },
        async ready() {
            for (const ele of lifetimes) {
                if (ele.ready) {
                    await ele.ready.call(this);
                }
            }
        },
        async moved() {
            for (const ele of lifetimes) {
                if (ele.moved) {
                    await ele.moved.call(this);
                }
            }
        },
        async error(err) {
            for (const ele of lifetimes) {
                if (ele.error) {
                    await ele.error.call(this, err);
                }
            }
        },
    };
}
function mergePageLifetimes(lifetimes) {
    return {
        async show() {
            for (const ele of lifetimes) {
                if (ele.show) {
                    await ele.show.call(this);
                }
            }
        },
        async hide() {
            for (const ele of lifetimes) {
                if (ele.hide) {
                    await ele.hide.call(this);
                }
            }
        },
        async resize(size) {
            for (const ele of lifetimes) {
                if (ele.resize) {
                    await ele.resize.call(this, size);
                }
            }
        },
    };
}
let G_OAKPAGE;
let G_OAKCOMPONENT;
function initialize(storageSchema, createFeatures, createContext, triggers, checkers, aspectDict, initialData) {
    const { subscribe, features } = (0, initialize_1.initialize)(storageSchema, createFeatures, createContext, triggers, checkers, aspectDict, initialData);
    return {
        OakPage: (options, componentOptions = {}) => {
            const oakOptions = createPageOptions(options, subscribe, features);
            const { properties, pageLifetimes, lifetimes, methods, data, observers } = oakOptions;
            const { properties: p2, pageLifetimes: pl2, lifetimes: l2, methods: m2, data: d2, observers: o2, ...restOptions } = componentOptions;
            const pls = [pageLifetimes];
            if (pl2) {
                pls.push(pl2);
            }
            const ls = [lifetimes];
            if (l2) {
                ls.push(l2);
            }
            return Component({
                data: (0, lodash_1.assign)({}, d2, data),
                properties: (0, lodash_1.assign)({}, p2, properties),
                observers: (0, lodash_1.assign)({}, o2, observers),
                methods: {
                    onLoad() {
                        console.log('onLoad', this.data.oakId);
                    },
                    ...m2,
                    ...methods,
                },
                pageLifetimes: mergePageLifetimes(pls),
                lifetimes: mergeLifetimes(ls),
                ...restOptions,
            });
        },
        OakComponent: (options, componentOptions = {}) => {
            const oakOptions = createComponentOptions(options, subscribe, features);
            const { properties, pageLifetimes, lifetimes, methods, data, observers } = oakOptions;
            const { properties: p2, pageLifetimes: pl2, lifetimes: l2, methods: m2, data: d2, observers: o2, ...restOptions } = componentOptions;
            const pls = [pageLifetimes, pl2].filter(ele => !!ele);
            const ls = [lifetimes, l2].filter(ele => !!ele);
            return Component({
                data: (0, lodash_1.assign)({}, d2, data),
                properties: (0, lodash_1.assign)({}, p2, properties),
                observers: (0, lodash_1.assign)({}, o2, observers),
                methods: (0, lodash_1.assign)({}, m2, methods),
                pageLifetimes: mergePageLifetimes(pls),
                lifetimes: mergeLifetimes(ls),
                ...restOptions,
            });
        },
    };
}
exports.initialize = initialize;
