"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setUpdateData = exports.callPicker = exports.execute = exports.loadMore = exports.refresh = exports.reRender = exports.onPathSet = exports.unsubscribe = exports.subscribe = void 0;
var tslib_1 = require("tslib");
var assert_1 = require("oak-domain/lib/utils/assert");
var types_1 = require("oak-domain/lib/types");
var Feature_1 = require("./types/Feature");
function subscribe() {
    var _this = this;
    if (!this.subscribed) {
        this.subscribed = (0, Feature_1.subscribe)(function () { return _this.reRender(); });
    }
}
exports.subscribe = subscribe;
function unsubscribe() {
    if (this.subscribed) {
        this.subscribed();
        this.subscribed = undefined;
    }
}
exports.unsubscribe = unsubscribe;
function onPathSet(option) {
    return tslib_1.__awaiter(this, void 0, void 0, function () {
        var _a, props, state, oakEntity, oakPath, oakProjection, oakIsPicker, oakFilters, oakSorters, oakId, entity, path, projection, isList, filters, sorters, pagination, features, filters2, oakFilters2, _loop_1, filters_1, filters_1_1, ele, proj, sorters2, oakSorters2, _loop_2, sorters_1, sorters_1_1, ele, oakPath2;
        var e_1, _b, e_2, _c;
        return tslib_1.__generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    _a = this, props = _a.props, state = _a.state;
                    oakEntity = props.oakEntity, oakPath = props.oakPath, oakProjection = props.oakProjection, oakIsPicker = props.oakIsPicker, oakFilters = props.oakFilters, oakSorters = props.oakSorters, oakId = props.oakId;
                    entity = option.entity, path = option.path, projection = option.projection, isList = option.isList, filters = option.filters, sorters = option.sorters, pagination = option.pagination;
                    features = this.features;
                    filters2 = [];
                    if (oakFilters) {
                        oakFilters2 = typeof oakFilters === 'string' ? JSON.parse(oakFilters) : oakFilters;
                        filters2.push.apply(filters2, tslib_1.__spreadArray([], tslib_1.__read(oakFilters2), false));
                    }
                    else if (filters) {
                        _loop_1 = function (ele) {
                            var _e;
                            var filter = ele.filter, name_1 = ele["#name"];
                            filters2.push((_e = {
                                    filter: typeof filter === 'function'
                                        ? function () {
                                            return filter({
                                                features: features,
                                                props: props,
                                                state: state
                                            });
                                        }
                                        : filter
                                },
                                _e['#name'] = name_1,
                                _e));
                        };
                        try {
                            for (filters_1 = tslib_1.__values(filters), filters_1_1 = filters_1.next(); !filters_1_1.done; filters_1_1 = filters_1.next()) {
                                ele = filters_1_1.value;
                                _loop_1(ele);
                            }
                        }
                        catch (e_1_1) { e_1 = { error: e_1_1 }; }
                        finally {
                            try {
                                if (filters_1_1 && !filters_1_1.done && (_b = filters_1.return)) _b.call(filters_1);
                            }
                            finally { if (e_1) throw e_1.error; }
                        }
                    }
                    proj = oakProjection && (typeof oakProjection === 'string' ? JSON.parse(oakProjection) : oakProjection);
                    if (!proj && projection) {
                        proj = typeof projection === 'function'
                            ? function () {
                                return projection({
                                    features: features,
                                    props: props,
                                    state: state,
                                });
                            }
                            : projection;
                    }
                    sorters2 = [];
                    if (oakSorters) {
                        oakSorters2 = typeof oakSorters === 'string' ? JSON.parse(oakSorters) : oakSorters;
                        sorters2.push.apply(sorters2, tslib_1.__spreadArray([], tslib_1.__read(oakSorters2), false));
                    }
                    else if (sorters) {
                        _loop_2 = function (ele) {
                            var _f;
                            var sorter = ele.sorter, name_2 = ele["#name"];
                            sorters.push((_f = {
                                    sorter: typeof sorter === 'function'
                                        ? function () {
                                            return sorter({
                                                features: features,
                                                props: props,
                                                state: state,
                                            });
                                        }
                                        : sorter
                                },
                                _f['#name'] = name_2,
                                _f));
                        };
                        try {
                            for (sorters_1 = tslib_1.__values(sorters), sorters_1_1 = sorters_1.next(); !sorters_1_1.done; sorters_1_1 = sorters_1.next()) {
                                ele = sorters_1_1.value;
                                _loop_2(ele);
                            }
                        }
                        catch (e_2_1) { e_2 = { error: e_2_1 }; }
                        finally {
                            try {
                                if (sorters_1_1 && !sorters_1_1.done && (_c = sorters_1.return)) _c.call(sorters_1);
                            }
                            finally { if (e_2) throw e_2.error; }
                        }
                    }
                    oakPath2 = oakPath || path;
                    (0, assert_1.assert)(oakPath2, '没有正确的path信息，请检查是否配置正确');
                    features.runningTree.createNode({
                        path: oakPath2,
                        entity: (oakEntity || entity),
                        isList: isList,
                        isPicker: oakIsPicker,
                        projection: proj,
                        pagination: pagination,
                        filters: filters2,
                        sorters: sorters2,
                    });
                    Object.assign(this.state, {
                        oakEntity: (oakEntity || entity),
                        oakFullpath: oakPath2,
                        oakIsReady: true,
                    });
                    if (!isList) return [3 /*break*/, 2];
                    return [4 /*yield*/, features.runningTree.refresh(oakPath2)];
                case 1:
                    _d.sent();
                    return [3 /*break*/, 4];
                case 2:
                    if (!oakId) return [3 /*break*/, 4];
                    return [4 /*yield*/, features.runningTree.setId(oakPath2, oakId)];
                case 3:
                    _d.sent();
                    _d.label = 4;
                case 4: return [2 /*return*/];
            }
        });
    });
}
exports.onPathSet = onPathSet;
function reRender(option, extra) {
    return tslib_1.__awaiter(this, void 0, void 0, function () {
        var features, formData, rows, oakDirty, oakLoading, oakPullDownRefreshLoading, oakLoadingMore, oakExecuting, data, _a, k, oakAllowExecuting, err_1, data, _b;
        var _c;
        return tslib_1.__generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    features = this.features;
                    formData = option.formData;
                    if (!(this.state.oakEntity && this.state.oakFullpath)) return [3 /*break*/, 9];
                    return [4 /*yield*/, this.features.runningTree.getFreshValue(this.state.oakFullpath)];
                case 1:
                    rows = _d.sent();
                    oakDirty = this.features.runningTree.isDirty(this.state.oakFullpath);
                    oakLoading = !this.pullDownRefresh && this.features.runningTree.isLoading(this.state.oakFullpath);
                    oakPullDownRefreshLoading = this.pullDownRefresh && this.features.runningTree.isLoading(this.state.oakFullpath);
                    oakLoadingMore = this.features.runningTree.isLoadingMore(this.state.oakFullpath);
                    oakExecuting = this.features.runningTree.isExecuting(this.state.oakFullpath);
                    if (!formData) return [3 /*break*/, 3];
                    return [4 /*yield*/, formData.call(this, {
                            data: rows,
                            features: features,
                            props: this.props,
                        })];
                case 2:
                    _a = _d.sent();
                    return [3 /*break*/, 4];
                case 3:
                    _a = {};
                    _d.label = 4;
                case 4:
                    data = _a;
                    for (k in data) {
                        if (data[k] === undefined) {
                            Object.assign(data, (_c = {},
                                _c[k] = null,
                                _c));
                        }
                    }
                    Object.assign(data, {
                        oakDirty: oakDirty,
                        oakLoading: oakLoading,
                        oakLoadingMore: oakLoadingMore,
                        oakExecuting: oakExecuting,
                        oakPullDownRefreshLoading: oakPullDownRefreshLoading,
                    });
                    if (extra) {
                        Object.assign(data, extra);
                    }
                    oakAllowExecuting = false;
                    _d.label = 5;
                case 5:
                    _d.trys.push([5, 7, , 8]);
                    return [4 /*yield*/, this.features.runningTree.tryExecute(this.state.oakFullpath)];
                case 6:
                    oakAllowExecuting = _d.sent();
                    return [3 /*break*/, 8];
                case 7:
                    err_1 = _d.sent();
                    if (err_1 instanceof types_1.OakUserException) {
                        oakAllowExecuting = err_1;
                    }
                    else {
                        oakAllowExecuting = false;
                        throw err_1;
                    }
                    return [3 /*break*/, 8];
                case 8:
                    Object.assign(data, {
                        oakAllowExecuting: oakAllowExecuting,
                    });
                    this.setState(data);
                    return [3 /*break*/, 13];
                case 9:
                    if (!formData) return [3 /*break*/, 11];
                    return [4 /*yield*/, formData.call(this, {
                            features: features,
                            props: this.props,
                        })];
                case 10:
                    _b = _d.sent();
                    return [3 /*break*/, 12];
                case 11:
                    _b = {};
                    _d.label = 12;
                case 12:
                    data = _b;
                    if (extra) {
                        Object.assign(data, extra);
                    }
                    this.setState(data);
                    _d.label = 13;
                case 13: return [2 /*return*/];
            }
        });
    });
}
exports.reRender = reRender;
function refresh() {
    return tslib_1.__awaiter(this, void 0, void 0, function () {
        var err_2;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!(this.state.oakEntity && this.state.oakFullpath)) return [3 /*break*/, 4];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, this.features.runningTree.refresh(this.state.oakFullpath)];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    err_2 = _a.sent();
                    this.setMessage({
                        type: 'error',
                        content: err_2.message,
                    });
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
}
exports.refresh = refresh;
function loadMore() {
    return tslib_1.__awaiter(this, void 0, void 0, function () {
        var err_3;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!(this.state.oakEntity && this.state.oakFullpath)) return [3 /*break*/, 4];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, this.features.runningTree.loadMore(this.state.oakFullpath)];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    err_3 = _a.sent();
                    this.setMessage({
                        type: 'error',
                        content: err_3.message,
                    });
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
}
exports.loadMore = loadMore;
function execute(path) {
    return tslib_1.__awaiter(this, void 0, void 0, function () {
        var fullpath, result, err_4, attrs, message;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (this.state.oakExecuting) {
                        throw new Error('请仔细设计按钮状态，不要允许重复点击！');
                    }
                    this.setState({
                        oakFocused: undefined,
                        oakExecuting: true,
                    });
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    fullpath = path
                        ? "".concat(this.state.oakFullpath, ".").concat(path)
                        : this.state.oakFullpath;
                    return [4 /*yield*/, this.features.runningTree.execute(fullpath)];
                case 2:
                    result = _a.sent();
                    this.setState({
                        oakExecuting: false,
                    });
                    this.setMessage({
                        type: 'success',
                        content: '操作成功',
                    });
                    return [2 /*return*/, result];
                case 3:
                    err_4 = _a.sent();
                    if (err_4 instanceof types_1.OakUserException) {
                        if (err_4 instanceof types_1.OakInputIllegalException) {
                            attrs = err_4.getAttributes();
                            message = err_4.message;
                            this.setState({
                                oakFocused: {
                                    attr: attrs[0],
                                    message: message,
                                },
                                oakExecuting: false,
                            });
                            throw err_4;
                        }
                    }
                    this.setMessage({
                        type: 'error',
                        content: err_4.message,
                    });
                    throw err_4;
                case 4: return [2 /*return*/];
            }
        });
    });
}
exports.execute = execute;
function callPicker(attr, params) {
    if (params === void 0) { params = {}; }
    if (this.state.oakExecuting) {
        return;
    }
    var relation = this.features.cache.judgeRelation(this.state.oakEntity, attr);
    var subEntity;
    if (relation === 2) {
        subEntity = attr;
    }
    else {
        (0, assert_1.assert)(typeof relation === 'string');
        subEntity = relation;
    }
    var url = "/pickers/".concat(subEntity, "?oakIsPicker=true&oakParentEntity=").concat(this.state.oakEntity, "&oakParent=").concat(this.state.oakFullpath, "&oakPath=").concat(attr);
    for (var k in params) {
        url += "&".concat(k, "=").concat(JSON.stringify(params[k]));
    }
    this.navigateTo({
        url: url,
    });
}
exports.callPicker = callPicker;
function setUpdateData(attr, data) {
    return tslib_1.__awaiter(this, void 0, void 0, function () {
        var _a, _b;
        return tslib_1.__generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    (0, assert_1.assert)(attr.indexOf('.') === -1, 'setUpdateData只能设置当前对象属性，子层对象请写完整的addOperation');
                    if (!this.props.oakId) return [3 /*break*/, 1];
                    return [2 /*return*/, this.addOperation({
                            action: 'update',
                            data: (_a = {},
                                _a[attr] = data,
                                _a)
                        })];
                case 1: return [4 /*yield*/, this.addOperation({
                        action: 'create',
                        data: (_b = {},
                            _b[attr] = data,
                            _b)
                    })];
                case 2:
                    _c.sent();
                    _c.label = 3;
                case 3: return [2 /*return*/];
            }
        });
    });
}
exports.setUpdateData = setUpdateData;
