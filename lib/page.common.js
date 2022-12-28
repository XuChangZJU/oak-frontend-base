"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.destroyNode = exports.execute = exports.loadMore = exports.refresh = exports.reRender = exports.onPathSet = void 0;
var tslib_1 = require("tslib");
var assert_1 = require("oak-domain/lib/utils/assert");
var lodash_1 = require("oak-domain/lib/utils/lodash");
function onPathSet(option) {
    var e_1, _a, e_2, _b;
    var _this = this;
    var _c = this, props = _c.props, state = _c.state;
    var oakPath = props.oakPath, oakProjection = props.oakProjection, oakIsPicker = props.oakIsPicker, oakFilters = props.oakFilters, oakSorters = props.oakSorters, oakId = props.oakId;
    var entity = option.entity, path = option.path, projection = option.projection, isList = option.isList, filters = option.filters, sorters = option.sorters, pagination = option.pagination;
    var features = this.features;
    var oakPath2 = oakPath || path;
    if (entity) {
        var entity2 = entity instanceof Function ? entity.call(this) : entity;
        var filters2 = [];
        if (oakFilters) {
            // 这里在跳页面的时候用this.navigate应该可以限制传过来的filter的格式
            var oakFilters2 = typeof oakFilters === 'string' ? JSON.parse(oakFilters) : oakFilters;
            filters2.push.apply(filters2, tslib_1.__spreadArray([], tslib_1.__read(oakFilters2), false));
        }
        else if (filters) {
            var _loop_1 = function (ele) {
                var _d;
                var filter = ele.filter, name_1 = ele["#name"];
                filters2.push((_d = {
                        filter: typeof filter === 'function'
                            ? function () {
                                return filter.call(_this, {
                                    features: features,
                                    props: _this.props,
                                    state: _this.state,
                                });
                            }
                            : filter
                    },
                    _d['#name'] = name_1,
                    _d));
            };
            try {
                for (var filters_1 = tslib_1.__values(filters), filters_1_1 = filters_1.next(); !filters_1_1.done; filters_1_1 = filters_1.next()) {
                    var ele = filters_1_1.value;
                    _loop_1(ele);
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (filters_1_1 && !filters_1_1.done && (_a = filters_1.return)) _a.call(filters_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
        }
        var proj = oakProjection && (typeof oakProjection === 'string' ? JSON.parse(oakProjection) : oakProjection);
        if (!proj && projection) {
            proj = typeof projection === 'function'
                ? function () {
                    return projection.call(_this, {
                        features: features,
                        props: _this.props,
                        state: _this.state,
                    });
                }
                : projection;
        }
        var sorters2 = [];
        if (oakSorters) {
            // 这里在跳页面的时候用this.navigate应该可以限制传过来的sorter的格式
            var oakSorters2 = typeof oakSorters === 'string' ? JSON.parse(oakSorters) : oakSorters;
            sorters2.push.apply(sorters2, tslib_1.__spreadArray([], tslib_1.__read(oakSorters2), false));
        }
        else if (sorters) {
            var _loop_2 = function (ele) {
                var _e;
                var sorter = ele.sorter, name_2 = ele["#name"];
                sorters2.push((_e = {
                        sorter: typeof sorter === 'function'
                            ? function () {
                                return sorter.call(_this, {
                                    features: features,
                                    props: _this.props,
                                    state: _this.state,
                                });
                            }
                            : sorter
                    },
                    _e['#name'] = name_2,
                    _e));
            };
            try {
                for (var sorters_1 = tslib_1.__values(sorters), sorters_1_1 = sorters_1.next(); !sorters_1_1.done; sorters_1_1 = sorters_1.next()) {
                    var ele = sorters_1_1.value;
                    _loop_2(ele);
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (sorters_1_1 && !sorters_1_1.done && (_b = sorters_1.return)) _b.call(sorters_1);
                }
                finally { if (e_2) throw e_2.error; }
            }
        }
        (0, assert_1.assert)(oakPath2, '没有正确的path信息，请检查是否配置正确');
        features.runningTree.createNode({
            path: oakPath2,
            entity: entity2,
            isList: isList,
            isPicker: oakIsPicker,
            projection: proj,
            pagination: pagination,
            filters: filters2,
            sorters: sorters2,
            id: oakId,
        });
        this.setState({
            oakEntity: entity2,
            oakFullpath: oakPath2,
        });
    }
    else {
        this.setState({
            oakFullpath: oakPath2,
        });
        // 创建virtualNode
        features.runningTree.createNode({
            path: oakPath2,
        });
    }
    this.subscribed.push(features.runningTree.subscribeNode(function () { return _this.reRender(); }, oakPath2));
    this.refresh();
}
exports.onPathSet = onPathSet;
function reRender(option, extra) {
    var _a;
    var _this = this;
    var features = this.features;
    var formData = option.formData;
    if (this.state.oakEntity && this.state.oakFullpath) {
        var rows = this.features.runningTree.getFreshValue(this.state.oakFullpath);
        var oakDirty = this.features.runningTree.isDirty(this.state.oakFullpath);
        var oakLoading = !this.pullDownRefresh && this.features.runningTree.isLoading(this.state.oakFullpath);
        var oakPullDownRefreshLoading = !!this.pullDownRefresh && this.features.runningTree.isLoading(this.state.oakFullpath);
        var oakLoadingMore = this.features.runningTree.isLoadingMore(this.state.oakFullpath);
        var oakExecuting = this.features.runningTree.isExecuting(this.state.oakFullpath);
        var oakExecutable = !oakExecuting && this.features.runningTree.tryExecute(this.state.oakFullpath);
        var oakLegalActions = [];
        var actions = this.props.oakActions || option.actions;
        if (actions && actions.length > 0) {
            (0, assert_1.assert)(!option.isList, 'actions只能作用于单个对象页面上');
            var id = this.features.runningTree.getId(this.state.oakFullpath);
            var value = this.features.runningTree.getFreshValue(this.state.oakFullpath);
            if (id && value) {
                // 必须有值才判断action
                var testResult = actions.map(function (ele) { return ({
                    action: ele,
                    result: _this.checkOperation(_this.state.oakEntity, ele, { id: _this.props.oakId }, ['relation', 'row']),
                }); });
                oakLegalActions = testResult.filter(function (ele) { return ele.result; }).map(function (ele) { return ele.action; });
            }
        }
        var data = formData
            ? formData.call(this, {
                data: rows,
                features: features,
                props: this.props,
                legalActions: oakLegalActions,
            })
            : {};
        Object.assign(data, {
            oakLegalActions: oakLegalActions,
        });
        for (var k in data) {
            if (data[k] === undefined) {
                Object.assign(data, (_a = {},
                    _a[k] = null,
                    _a));
            }
        }
        Object.assign(data, {
            oakExecutable: oakExecutable,
            oakDirty: oakDirty,
            oakLoading: oakLoading,
            oakLoadingMore: oakLoadingMore,
            oakExecuting: oakExecuting,
            oakPullDownRefreshLoading: oakPullDownRefreshLoading,
        });
        if (extra) {
            Object.assign(data, extra);
        }
        this.setState(data);
    }
    else {
        var data = formData
            ? formData.call(this, {
                features: features,
                props: this.props,
            })
            : {};
        if (extra) {
            Object.assign(data, extra);
        }
        if (Object.keys(data).length === 0) {
            Object.assign(data, {
                __now: Date.now(), // 如果没有任何state被set，可能会不触发重渲染
            });
        }
        this.setState(data);
    }
}
exports.reRender = reRender;
function refresh() {
    return tslib_1.__awaiter(this, void 0, void 0, function () {
        var err_1;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!this.state.oakFullpath) return [3 /*break*/, 4];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, this.features.runningTree.refresh(this.state.oakFullpath)];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    err_1 = _a.sent();
                    this.setMessage({
                        type: 'error',
                        content: err_1.message,
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
        var err_2;
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
exports.loadMore = loadMore;
function execute(action, path, messageProps) {
    return tslib_1.__awaiter(this, void 0, void 0, function () {
        var fullpath, messageData;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (this.state.oakExecuting) {
                        throw new Error('请仔细设计按钮状态，不要允许重复点击！');
                    }
                    fullpath = path
                        ? "".concat(this.state.oakFullpath, ".").concat(path)
                        : this.state.oakFullpath;
                    return [4 /*yield*/, this.features.runningTree.execute(fullpath, action)];
                case 1:
                    _a.sent();
                    if (messageProps !== false) {
                        messageData = {
                            type: 'success',
                            content: '操作成功',
                        };
                        if (typeof messageProps === 'object') {
                            Object.assign(messageData, messageProps);
                        }
                        this.setMessage(messageData);
                    }
                    return [2 /*return*/];
            }
        });
    });
}
exports.execute = execute;
function destroyNode() {
    (0, assert_1.assert)(this.state.oakFullpath);
    this.features.runningTree.destroyNode(this.state.oakFullpath);
    (0, lodash_1.unset)(this.state, ['oakFullpath', 'oakEntity']);
}
exports.destroyNode = destroyNode;
