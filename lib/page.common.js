"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.destroyNode = exports.execute = exports.loadMore = exports.refresh = exports.reRender = exports.onPathSet = void 0;
var tslib_1 = require("tslib");
var assert_1 = require("oak-domain/lib/utils/assert");
var lodash_1 = require("oak-domain/lib/utils/lodash");
var relation_1 = require("oak-domain/lib/store/relation");
var filter_1 = require("oak-domain/lib/store/filter");
function onPathSet(option) {
    return tslib_1.__awaiter(this, void 0, void 0, function () {
        var _a, props, state, _b, oakPath, oakProjection, oakFilters, oakSorters, oakId, entity, path, projection, isList, filters, sorters, pagination, features, oakPath2, entity2_1, filters2, oakFilters2, _loop_1, filters_1, filters_1_1, ele, proj, sorters2, oakSorters2, _loop_2, sorters_1, sorters_1_1, ele, actions_1, cascadeActions_1;
        var e_1, _c, e_2, _d;
        var _this = this;
        return tslib_1.__generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    _a = this, props = _a.props, state = _a.state;
                    _b = props, oakPath = _b.oakPath, oakProjection = _b.oakProjection, oakFilters = _b.oakFilters, oakSorters = _b.oakSorters, oakId = _b.oakId;
                    entity = option.entity, path = option.path, projection = option.projection, isList = option.isList, filters = option.filters, sorters = option.sorters, pagination = option.pagination;
                    features = this.features;
                    oakPath2 = oakPath || path;
                    if (!entity) return [3 /*break*/, 2];
                    entity2_1 = entity instanceof Function ? entity.call(this) : entity;
                    filters2 = [];
                    if (oakFilters) {
                        oakFilters2 = typeof oakFilters === 'string' ? JSON.parse(oakFilters) : oakFilters;
                        filters2.push.apply(filters2, tslib_1.__spreadArray([], tslib_1.__read(oakFilters2), false));
                    }
                    if (filters) {
                        _loop_1 = function (ele) {
                            var _f;
                            var filter = ele.filter, name_1 = ele["#name"];
                            filters2.push((_f = {
                                    filter: typeof filter === 'function'
                                        ? function () {
                                            return filter.call(_this);
                                        }
                                        : filter
                                },
                                _f['#name'] = name_1,
                                _f));
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
                                if (filters_1_1 && !filters_1_1.done && (_c = filters_1.return)) _c.call(filters_1);
                            }
                            finally { if (e_1) throw e_1.error; }
                        }
                    }
                    proj = oakProjection && (typeof oakProjection === 'string' ? JSON.parse(oakProjection) : oakProjection);
                    if (!proj && projection) {
                        proj = typeof projection === 'function'
                            ? function () {
                                return projection.call(_this);
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
                            var _g;
                            var sorter = ele.sorter, name_2 = ele["#name"];
                            sorters2.push((_g = {
                                    sorter: typeof sorter === 'function'
                                        ? function () {
                                            return sorter.call(_this);
                                        }
                                        : sorter
                                },
                                _g['#name'] = name_2,
                                _g));
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
                                if (sorters_1_1 && !sorters_1_1.done && (_d = sorters_1.return)) _d.call(sorters_1);
                            }
                            finally { if (e_2) throw e_2.error; }
                        }
                    }
                    (0, assert_1.assert)(oakPath2, '没有正确的path信息，请检查是否配置正确');
                    actions_1 = option.actions, cascadeActions_1 = option.cascadeActions;
                    features.runningTree.createNode({
                        path: oakPath2,
                        entity: entity2_1,
                        isList: isList,
                        projection: proj,
                        pagination: pagination,
                        filters: filters2,
                        sorters: sorters2,
                        id: oakId,
                        actions: typeof actions_1 === 'function' ? function () { return actions_1.call(_this); } : actions_1,
                        cascadeActions: cascadeActions_1 && (function () { return cascadeActions_1.call(_this); }),
                    });
                    this.subscribed.push(features.runningTree.subscribeNode(function (path2) {
                        // 父结点改变，子结点要重渲染
                        if (_this.state.oakFullpath.includes(path2)) {
                            _this.reRender();
                        }
                    }, oakPath2));
                    // 确保SetState生效，这里改成异步
                    return [4 /*yield*/, new Promise(function (resolve) {
                            _this.setState({
                                oakEntity: entity2_1,
                                oakFullpath: oakPath2,
                            }, function () { return resolve(0); });
                        })];
                case 1:
                    // 确保SetState生效，这里改成异步
                    _e.sent();
                    return [3 /*break*/, 4];
                case 2:
                    // 创建virtualNode
                    features.runningTree.createNode({
                        path: oakPath2,
                    });
                    this.subscribed.push(features.runningTree.subscribeNode(function (path2) {
                        if (path2 === _this.state.oakFullpath) {
                            _this.reRender();
                        }
                    }, oakPath2));
                    return [4 /*yield*/, new Promise(function (resolve) {
                            _this.setState({
                                oakFullpath: oakPath2,
                            }, function () { return resolve(0); });
                        })];
                case 3:
                    _e.sent();
                    _e.label = 4;
                case 4:
                    if (entity && projection || oakProjection) {
                        this.refresh();
                    }
                    else {
                        this.reRender();
                    }
                    return [2 /*return*/];
            }
        });
    });
}
exports.onPathSet = onPathSet;
function checkActionsAndCascadeEntities(rows, option) {
    var e_3, _a;
    var _this = this;
    var checkTypes = ['relation', 'row', 'logical', 'logicalRelation'];
    var actions = this.props.oakActions ? JSON.parse(this.props.oakActions) : (typeof option.actions === 'function' ? option.actions.call(this) : option.actions);
    var legalActions = [];
    if (actions) {
        var _loop_3 = function (action) {
            if (rows instanceof Array) {
                (0, assert_1.assert)(option.isList);
                var filter = this_1.features.runningTree.getIntrinsticFilters(this_1.state.oakFullpath);
                if (action === 'create' || typeof action === 'object' && action.action === 'create') {
                    // 创建对象的判定不落在具体行上，但要考虑list上外键相关属性的限制
                    var data = typeof action === 'object' && (0, lodash_1.cloneDeep)(action.data);
                    if (this_1.checkOperation(this_1.state.oakEntity, 'create', data, filter, checkTypes)) {
                        legalActions.push(action);
                    }
                }
                else {
                    var a2_1 = typeof action === 'object' ? action.action : action;
                    // 先尝试整体测试是否通过，再测试每一行
                    // todo，这里似乎还能优化，这些行一次性进行测试比单独测试的性能要高
                    if (this_1.checkOperation(this_1.state.oakEntity, a2_1, undefined, filter, checkTypes)) {
                        rows.forEach(function (row) {
                            if (row['#oakLegalActions']) {
                                row['#oakLegalActions'].push(action);
                            }
                            else {
                                Object.assign(row, {
                                    '#oakLegalActions': [action],
                                });
                            }
                        });
                    }
                    else {
                        rows.forEach(function (row) {
                            var id = row.id;
                            if (_this.checkOperation(_this.state.oakEntity, a2_1, undefined, { id: id }, checkTypes)) {
                                if (row['#oakLegalActions']) {
                                    row['#oakLegalActions'].push(action);
                                }
                                else {
                                    Object.assign(row, {
                                        '#oakLegalActions': [action],
                                    });
                                }
                            }
                        });
                    }
                }
            }
            else {
                (0, assert_1.assert)(!option.isList);
                if (action === 'create' || typeof action === 'object' && action.action === 'create') {
                    // 如果是create，根据updateData来判定。create动作应该是自动创建行的并将$$createAt$$置为1
                    if (rows.$$createAt$$ === 1) {
                        var _d = tslib_1.__read(this_1.features.runningTree.getOperations(this_1.state.oakFullpath), 1), operation = _d[0].operation;
                        if (this_1.checkOperation(this_1.state.oakEntity, 'create', operation.data, undefined, checkTypes)) {
                            if (rows['#oakLegalActions']) {
                                rows['#oakLegalActions'].push(action);
                            }
                            else {
                                Object.assign(rows, {
                                    '#oakLegalActions': [action],
                                });
                            }
                        }
                    }
                }
                else {
                    var a2 = typeof action === 'object' ? action.action : action;
                    var data = typeof action === 'object' ? action.data : undefined;
                    var filter = this_1.features.runningTree.getIntrinsticFilters(this_1.state.oakFullpath);
                    if (this_1.checkOperation(this_1.state.oakEntity, a2, data, filter, checkTypes)) {
                        legalActions.push(action);
                        if (rows['#oakLegalActions']) {
                            rows['#oakLegalActions'].push(action);
                        }
                        else {
                            Object.assign(rows, {
                                '#oakLegalActions': [action],
                            });
                        }
                    }
                }
            }
        };
        var this_1 = this;
        try {
            // todo 这里actions整体进行测试的性能应该要高于一个个去测试
            for (var _b = tslib_1.__values(actions), _c = _b.next(); !_c.done; _c = _b.next()) {
                var action = _c.value;
                _loop_3(action);
            }
        }
        catch (e_3_1) { e_3 = { error: e_3_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_3) throw e_3.error; }
        }
    }
    var cascadeActionDict = this.props.oakCascadeActions ? JSON.parse(this.props.oakCascadeActions) : ((option.cascadeActions && option.cascadeActions.call(this)));
    if (cascadeActionDict) {
        var addToRow_1 = function (r, e, a) {
            var _a, _b;
            if (!r['#oakLegalCascadeActions']) {
                Object.assign(r, {
                    '#oakLegalCascadeActions': (_a = {},
                        _a[e] = [a],
                        _a),
                });
            }
            else if (!r['#oakLegalCascadeActions'][e]) {
                Object.assign(r['#oakLegalCascadeActions'], (_b = {},
                    _b[e] = [a],
                    _b));
            }
            else {
                r['#oakLegalCascadeActions'][e].push(a);
            }
        };
        var _loop_4 = function (e) {
            var e_4, _e;
            var cascadeActions = cascadeActionDict[e];
            if (cascadeActions) {
                var rel_1 = (0, relation_1.judgeRelation)(this_2.features.cache.getSchema(), this_2.state.oakEntity, e);
                (0, assert_1.assert)(rel_1 instanceof Array, "".concat(this_2.state.oakFullpath, "\u4E0A\u6240\u5B9A\u4E49\u7684cascadeAction\u4E2D\u7684\u952E\u503C").concat(e, "\u4E0D\u662F\u4E00\u5BF9\u591A\u6620\u5C04"));
                var _loop_5 = function (action) {
                    var _h, _j, _k, _l;
                    if (rows instanceof Array) {
                        if (action === 'create' || typeof action === 'object' && action.action === 'create') {
                            rows.forEach(function (row) {
                                var _a;
                                var intrinsticData = rel_1[1] ? (_a = {},
                                    _a[rel_1[1]] = row.id,
                                    _a) : { entity: _this.state.oakEntity, entityId: row.id };
                                if (typeof action === 'object') {
                                    Object.assign(intrinsticData, action.data);
                                }
                                if (_this.checkOperation(rel_1[0], 'create', intrinsticData, undefined, checkTypes)) {
                                    addToRow_1(row, e, action);
                                }
                            });
                        }
                        else {
                            var a2_2 = typeof action === 'object' ? action.action : action;
                            var filter = typeof action === 'object' ? action.filter : undefined;
                            var intrinsticFilter = rel_1[1] ? (_h = {},
                                _h[rel_1[1].slice(0, rel_1[1].length - 2)] = this_2.features.runningTree.getIntrinsticFilters(this_2.state.oakFullpath),
                                _h) : (_j = {},
                                _j[this_2.state.oakEntity] = this_2.features.runningTree.getIntrinsticFilters(this_2.state.oakFullpath),
                                _j);
                            var filter2 = (0, filter_1.combineFilters)([filter, intrinsticFilter]);
                            // 先尝试整体测试是否通过，再测试每一行
                            // todo，这里似乎还能优化，这些行一次性进行测试比单独测试的性能要高
                            if (this_2.checkOperation(rel_1[0], a2_2, undefined, filter2, checkTypes)) {
                                rows.forEach(function (row) { return addToRow_1(row, e, action); });
                            }
                            else {
                                rows.forEach(function (row) {
                                    var _a;
                                    var id = row.id;
                                    var intrinsticFilter = rel_1[1] ? (_a = {},
                                        _a[rel_1[1]] = id,
                                        _a) : { entity: _this.state.oakEntity, entityId: row.id };
                                    if (typeof action === 'object') {
                                        Object.assign(intrinsticFilter, action.filter);
                                    }
                                    if (_this.checkOperation(rel_1[0], a2_2, undefined, intrinsticFilter, checkTypes)) {
                                        addToRow_1(row, e, action);
                                    }
                                });
                            }
                        }
                    }
                    else {
                        if (action === 'create' || typeof action === 'object' && action.action === 'create') {
                            var intrinsticData = rel_1[1] ? (_k = {},
                                _k[rel_1[1]] = rows.id,
                                _k) : { entity: this_2.state.oakEntity, entityId: rows.id };
                            if (typeof action === 'object') {
                                Object.assign(intrinsticData, action.data);
                            }
                            if (this_2.checkOperation(rel_1[0], 'create', intrinsticData, undefined, checkTypes)) {
                                addToRow_1(rows, e, action);
                            }
                        }
                        else {
                            var a2 = typeof action === 'object' ? action.action : action;
                            var filter = typeof action === 'object' ? action.filter : undefined;
                            var intrinsticFilter = rel_1[1] ? (_l = {},
                                _l[rel_1[1]] = rows.id,
                                _l) : { entity: this_2.state.oakEntity, entityId: rows.id };
                            var filter2 = (0, filter_1.combineFilters)([filter, intrinsticFilter]);
                            // 先尝试整体测试是否通过，再测试每一行
                            // todo，这里似乎还能优化，这些行一次性进行测试比单独测试的性能要高
                            if (this_2.checkOperation(rel_1[0], a2, undefined, filter2, checkTypes)) {
                                addToRow_1(rows, e, action);
                            }
                        }
                    }
                };
                try {
                    for (var _f = (e_4 = void 0, tslib_1.__values(cascadeActions)), _g = _f.next(); !_g.done; _g = _f.next()) {
                        var action = _g.value;
                        _loop_5(action);
                    }
                }
                catch (e_4_1) { e_4 = { error: e_4_1 }; }
                finally {
                    try {
                        if (_g && !_g.done && (_e = _f.return)) _e.call(_f);
                    }
                    finally { if (e_4) throw e_4.error; }
                }
            }
        };
        var this_2 = this;
        for (var e in cascadeActionDict) {
            _loop_4(e);
        }
    }
    return legalActions;
}
function reRender(option, extra) {
    var _a;
    var features = this.features;
    var formData = option.formData;
    if (this.state.oakEntity && this.state.oakFullpath) {
        var rows = this.features.runningTree.getFreshValue(this.state.oakFullpath);
        var oakDirty = this.features.runningTree.isDirty(this.state.oakFullpath);
        /**
         * 这里的pullDownRefresh处理的应该有问题，先不动。to wangkejun.  By Xc 20230201
         */
        var oakLoading = !this.pullDownRefresh && this.features.runningTree.isLoading(this.state.oakFullpath);
        var oakPullDownRefreshLoading = !!this.pullDownRefresh && this.features.runningTree.isLoading(this.state.oakFullpath);
        var oakLoadingMore = this.features.runningTree.isLoadingMore(this.state.oakFullpath);
        var oakExecuting = this.features.runningTree.isExecuting(this.state.oakFullpath);
        var oakExecutable = !oakExecuting && this.features.runningTree.tryExecute(this.state.oakFullpath);
        if (rows) {
            var oakLegalActions = checkActionsAndCascadeEntities.call(this, rows, option);
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
            if (option.isList) {
                // 因为oakFilters和props里的oakFilters同名，这里只能先注掉，好像还没有组件用过
                // const oakFilters = (this as ComponentFullThisType<ED, T, true, Cxt, FrontCxt>).getFilters();
                // const oakSorters = (this as ComponentFullThisType<ED, T, true, Cxt, FrontCxt>).getSorters();
                var oakPagination = this.getPagination();
                Object.assign(data, {
                    // oakFilters,
                    // oakSorters,
                    oakPagination: oakPagination,
                });
            }
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
        if (this.state.oakFullpath) {
            /**
             * loadingMore和pullLoading设计上有问题，暂不处理
             */
            var oakDirty = this.features.runningTree.isDirty(this.state.oakFullpath);
            var oakExecuting = this.features.runningTree.isExecuting(this.state.oakFullpath);
            var oakExecutable = !oakExecuting && this.features.runningTree.tryExecute(this.state.oakFullpath);
            var oakLoading = this.features.runningTree.isLoading(this.state.oakFullpath);
            Object.assign(data, {
                oakDirty: oakDirty,
                oakExecutable: oakExecutable,
                oakExecuting: oakExecuting,
                oakLoading: oakLoading,
            });
        }
        Object.assign({
            __time: Date.now(),
        }); // 有些环境下如果传空值不触发判断
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
        var fullpath, message, messageData;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (this.state.oakExecuting) {
                        throw new Error('请仔细设计按钮状态，不要允许重复点击！');
                    }
                    fullpath = path ? path : this.state.oakFullpath;
                    return [4 /*yield*/, this.features.runningTree.execute(fullpath, action)];
                case 1:
                    message = (_a.sent()).message;
                    if (messageProps !== false) {
                        messageData = {
                            type: 'success',
                            content: message || '操作成功',
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
