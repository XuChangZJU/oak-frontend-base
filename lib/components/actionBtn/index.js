"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var usefulFn_1 = require("../../utils/usefulFn");
exports.default = OakComponent({
    isList: false,
    properties: {
        entity: '',
        extraActions: [],
        actions: [],
        cascadeActions: {},
        onAction: (function () { return undefined; }),
    },
    data: {
        showMore: false,
        schema: {},
        items: [],
        moreItems: [],
    },
    lifetimes: {
        // 在Tabel组件render之后 才走进这个组件，应该不会存在没有数据的问题
        ready: function () {
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                var schema;
                return tslib_1.__generator(this, function (_a) {
                    schema = this.features.cache.getSchema();
                    // 小程序这里还要跑一下
                    if (process.env.OAK_PLATFORM === 'wechatMp') {
                        this.makeItems();
                    }
                    this.setState({
                        schema: schema,
                    });
                    return [2 /*return*/];
                });
            });
        }
    },
    listeners: {},
    methods: {
        makeItems: function (isMobile) {
            var _this = this;
            var schema = this.state.schema;
            var _a = this.props, actions = _a.actions, extraActions = _a.extraActions, onAction = _a.onAction, entity = _a.entity, cascadeActions = _a.cascadeActions;
            var column = 2;
            if (schema) {
                if (process.env.OAK_PLATFORM === 'web') {
                    column = 6;
                }
                if (process.env.OAK_PLATFORM === 'web' && isMobile) {
                    column = 2;
                }
                if ((extraActions === null || extraActions === void 0 ? void 0 : extraActions.length) || (actions === null || actions === void 0 ? void 0 : actions.length)) {
                    var actions2 = actions && tslib_1.__spreadArray([], tslib_1.__read(actions), false) || [];
                    if (extraActions) {
                        // 用户传的action默认排在前面
                        actions2.unshift.apply(actions2, tslib_1.__spreadArray([], tslib_1.__read(extraActions), false));
                    }
                    // 每一项里的action 和 path 用在小程序这边, onClick用于web
                    var items_1 = actions2.map(function (ele) { return ({
                        action: typeof ele !== 'string' ? ele.action : ele,
                        path: '',
                        label: _this.getLabel(ele, entity),
                        onClick: function () {
                            return onAction &&
                                onAction(typeof ele !== 'string' ? ele.action : ele, undefined);
                        },
                    }); });
                    cascadeActions && Object.keys(cascadeActions).map(function (key, index) {
                        var cascadeActionArr = cascadeActions[key];
                        if (cascadeActionArr && cascadeActionArr.length) {
                            cascadeActionArr.forEach(function (ele) {
                                items_1.push({
                                    action: typeof ele !== 'string' ? ele.action : ele,
                                    path: key,
                                    label: _this.getLabel2(schema, key, ele, entity),
                                    onClick: function () { return onAction && onAction(undefined, { path: key, action: typeof ele !== 'string' ? ele.action : ele }); },
                                });
                            });
                        }
                    });
                    var moreItems = items_1.splice(column);
                    this.setState({
                        items: items_1,
                        moreItems: moreItems
                    });
                }
            }
        },
        handleShow: function () {
            var showMore = this.state.showMore;
            this.setState({
                showMore: !showMore,
            });
        },
        onActionMp: function (e) {
            var _a = e.currentTarget.dataset, action = _a.action, path = _a.path;
            if (path !== '') {
                // 级联action的点击
                this.triggerEvent('onAction', {
                    action: undefined,
                    cascadeAction: {
                        path: path,
                        action: action,
                    }
                });
                return;
            }
            this.triggerEvent('onAction', { action: action, cascadeAction: undefined });
        },
        getLabel: function (actionItem, entity) {
            if (typeof actionItem !== 'string') {
                return actionItem.label;
            }
            else {
                if (['update', 'create', 'detail'].includes(actionItem)) {
                    return this.t("common:action.".concat(actionItem));
                }
                else {
                    return this.t("".concat(entity, ":action.").concat(actionItem));
                }
            }
        },
        getLabel2: function (schema, path, actionItem, entity) {
            if (typeof actionItem !== 'string') {
                return actionItem.label;
            }
            var entityI18n = (0, usefulFn_1.resolvePath)(schema, entity, path).entity;
            var label = this.t("".concat(entityI18n, ":action.").concat(actionItem));
            return label;
        }
    },
});
