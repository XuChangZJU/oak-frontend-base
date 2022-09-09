"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RunningTree = void 0;
var tslib_1 = require("tslib");
var assert_1 = require("oak-domain/lib/utils/assert");
var lodash_1 = require("oak-domain/lib/utils/lodash");
var filter_1 = require("oak-domain/lib/store/filter");
var modi_1 = require("oak-domain/lib/store/modi");
var relation_1 = require("oak-domain/lib/store/relation");
var mockId_1 = require("../utils/mockId");
var Feature_1 = require("../types/Feature");
var Node = /** @class */ (function () {
    function Node(entity, schema, cache, projection, parent, action, updateData) {
        var _this = this;
        this.entity = entity;
        this.schema = schema;
        this.cache = cache;
        this.projection = projection;
        this.parent = parent;
        this.action = action;
        this.dirty = undefined;
        this.refreshing = false;
        this.updateData = updateData || {};
        this.syncHandler = function (records) { return _this.onCacheSync(records); };
        this.cache.bindOnSync(this.syncHandler);
    }
    Node.prototype.getEntity = function () {
        return this.entity;
    };
    Node.prototype.setLocalUpdateData = function (attr, value) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var rel, subEntity, attr2, rel2;
            var _a, _b, _c;
            return tslib_1.__generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        rel = this.judgeRelation(attr);
                        subEntity = undefined;
                        attr2 = undefined;
                        if (rel === 2) {
                            if (value) {
                                Object.assign(this.updateData, {
                                    entity: attr,
                                    entityId: value,
                                });
                            }
                            else {
                                Object.assign(this.updateData, {
                                    entity: undefined,
                                    entityId: undefined,
                                });
                            }
                            subEntity = attr;
                            attr2 = attr;
                        }
                        else if (typeof rel === 'string') {
                            if (value) {
                                Object.assign(this.updateData, (_a = {},
                                    _a["".concat(attr, "Id")] = value,
                                    _a));
                            }
                            else {
                                Object.assign(this.updateData, (_b = {},
                                    _b["".concat(attr, "Id")] = undefined,
                                    _b));
                            }
                            subEntity = rel;
                            attr2 = attr;
                        }
                        else {
                            (0, assert_1.assert)(rel === 1);
                            Object.assign(this.updateData, (_c = {},
                                _c[attr] = value,
                                _c));
                            // 处理一下开发人员手动传xxxId
                            if (attr.endsWith('Id')) {
                                attr2 = attr.slice(0, attr.length - 2);
                                rel2 = this.judgeRelation(attr2);
                                if (typeof rel2 === 'string') {
                                    subEntity = rel2;
                                }
                            }
                        }
                        if (!subEntity) return [3 /*break*/, 2];
                        // 说明是更新了外键
                        return [4 /*yield*/, this.setForeignKey(attr2, subEntity, value)];
                    case 1:
                        // 说明是更新了外键
                        _d.sent();
                        _d.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        });
    };
    Node.prototype.setUpdateData = function (attr, value) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.setLocalUpdateData(attr, value)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.setDirty()];
                    case 2:
                        _a.sent();
                        this.refreshValue();
                        return [2 /*return*/];
                }
            });
        });
    };
    Node.prototype.getUpdateData = function () {
        return this.updateData;
    };
    Node.prototype.setMultiUpdateData = function (updateData) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var _a, _b, _i, k;
            return tslib_1.__generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _a = [];
                        for (_b in updateData)
                            _a.push(_b);
                        _i = 0;
                        _c.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 4];
                        k = _a[_i];
                        return [4 /*yield*/, this.setLocalUpdateData(k, updateData[k])];
                    case 2:
                        _c.sent();
                        _c.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4: return [4 /*yield*/, this.setDirty()];
                    case 5:
                        _c.sent();
                        this.refreshValue();
                        return [2 /*return*/];
                }
            });
        });
    };
    Node.prototype.setDirty = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var _a;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!!this.dirty) return [3 /*break*/, 3];
                        _a = this;
                        return [4 /*yield*/, generateNewId()];
                    case 1:
                        _a.dirty = _b.sent();
                        if (!this.parent) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.parent.setDirty()];
                    case 2:
                        _b.sent();
                        _b.label = 3;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    Node.prototype.setAction = function (action) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.action = action;
                        return [4 /*yield*/, this.setDirty()];
                    case 1:
                        _a.sent();
                        this.refreshValue();
                        return [2 /*return*/];
                }
            });
        });
    };
    Node.prototype.isDirty = function () {
        return !!this.dirty;
    };
    Node.prototype.getParent = function () {
        return this.parent;
    };
    Node.prototype.getProjection = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var _a;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!(typeof this.projection === 'function')) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.projection()];
                    case 1:
                        _a = _b.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        _a = this.projection;
                        _b.label = 3;
                    case 3: return [2 /*return*/, _a];
                }
            });
        });
    };
    Node.prototype.setBeforeExecute = function (_beforeExecute) {
        this.beforeExecute = _beforeExecute;
    };
    Node.prototype.setAfterExecute = function (_afterExecute) {
        this.afterExecute = _afterExecute;
    };
    Node.prototype.getBeforeExecute = function () {
        return this.beforeExecute;
    };
    Node.prototype.getAfterExecute = function () {
        return this.afterExecute;
    };
    Node.prototype.destroy = function () {
        this.cache.unbindOnSync(this.syncHandler);
    };
    Node.prototype.judgeRelation = function (attr) {
        var attr2 = attr.split(':')[0]; // 处理attr:prev
        return (0, relation_1.judgeRelation)(this.schema, this.entity, attr2);
    };
    Node.prototype.contains = function (filter, conditionalFilter) {
        return (0, filter_1.contains)(this.entity, this.schema, filter, conditionalFilter);
    };
    Node.prototype.repel = function (filter1, filter2) {
        return (0, filter_1.repel)(this.entity, this.schema, filter1, filter2);
    };
    return Node;
}());
var DEFAULT_PAGINATION = {
    currentPage: 1,
    pageSize: 20,
    append: true,
    more: true,
};
var ListNode = /** @class */ (function (_super) {
    tslib_1.__extends(ListNode, _super);
    function ListNode(entity, schema, cache, projection, projectionShape, parent, action, updateData, filters, sorters, pagination) {
        var _this = _super.call(this, entity, schema, cache, projection, parent, action, updateData) || this;
        _this.projectionShape = projectionShape;
        _this.children = [];
        _this.newBorn = [];
        _this.filters = filters || [];
        _this.sorters = sorters || [];
        _this.pagination = pagination || DEFAULT_PAGINATION;
        return _this;
    }
    ListNode.prototype.onCacheSync = function (records) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var createdIds, removeIds, records_1, records_1_1, record, a, _a, e, d, id, _b, e, f, currentIds, filter, sorterss, projection, _c, value;
            var e_1, _d;
            var _this = this;
            return tslib_1.__generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        if (this.refreshing) {
                            return [2 /*return*/];
                        }
                        createdIds = [];
                        removeIds = false;
                        try {
                            for (records_1 = tslib_1.__values(records), records_1_1 = records_1.next(); !records_1_1.done; records_1_1 = records_1.next()) {
                                record = records_1_1.value;
                                a = record.a;
                                switch (a) {
                                    case 'c': {
                                        _a = record, e = _a.e, d = _a.d;
                                        if (e === this.entity) {
                                            if (d instanceof Array) {
                                                d.forEach(function (dd) {
                                                    var id = dd.id;
                                                    createdIds.push(id);
                                                });
                                            }
                                            else {
                                                id = d.id;
                                                createdIds.push(id);
                                            }
                                        }
                                        break;
                                    }
                                    case 'r': {
                                        _b = record, e = _b.e, f = _b.f;
                                        if (e === this.entity) {
                                            // todo 这里更严格应该考虑f对当前value有无影响，同上面一样这里可能没有完整的供f用的cache数据
                                            removeIds = true;
                                        }
                                        break;
                                    }
                                    default: {
                                        break;
                                    }
                                }
                            }
                        }
                        catch (e_1_1) { e_1 = { error: e_1_1 }; }
                        finally {
                            try {
                                if (records_1_1 && !records_1_1.done && (_d = records_1.return)) _d.call(records_1);
                            }
                            finally { if (e_1) throw e_1.error; }
                        }
                        if (!(createdIds.length > 0 || removeIds)) return [3 /*break*/, 7];
                        currentIds = this.children
                            .map(function (ele) { var _a; return (_a = ele.getFreshValue()) === null || _a === void 0 ? void 0 : _a.id; })
                            .filter(function (ele) { return !!ele; });
                        filter = (0, filter_1.combineFilters)(tslib_1.__spreadArray([
                            {
                                id: {
                                    $in: currentIds.concat(createdIds),
                                },
                            }
                        ], tslib_1.__read(this.filters.map(function (ele) { return ele.filter; })), false));
                        return [4 /*yield*/, Promise.all(this.sorters.map(function (ele) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                                var sorter;
                                return tslib_1.__generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            sorter = ele.sorter;
                                            if (!(typeof sorter === 'function')) return [3 /*break*/, 2];
                                            return [4 /*yield*/, sorter()];
                                        case 1: return [2 /*return*/, _a.sent()];
                                        case 2: return [2 /*return*/, sorter];
                                    }
                                });
                            }); }))];
                    case 1:
                        sorterss = (_e.sent()).filter(function (ele) { return !!ele; });
                        if (!(typeof this.projection === 'function')) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.projection()];
                    case 2:
                        _c = _e.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        _c = this.projection;
                        _e.label = 4;
                    case 4:
                        projection = _c;
                        return [4 /*yield*/, this.cache.get(this.entity, {
                                data: projection,
                                filter: filter,
                                sorter: sorterss,
                            }, { obscure: true })];
                    case 5:
                        value = _e.sent();
                        return [4 /*yield*/, this.setValue(value)];
                    case 6:
                        _e.sent();
                        _e.label = 7;
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    ListNode.prototype.destroy = function () {
        var e_2, _a;
        _super.prototype.destroy.call(this);
        try {
            for (var _b = tslib_1.__values(this.children), _c = _b.next(); !_c.done; _c = _b.next()) {
                var child = _c.value;
                child.destroy();
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_2) throw e_2.error; }
        }
    };
    ListNode.prototype.setForeignKey = function (attr, entity, id) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                // todo 对list的update外键的情况等遇到了再写 by Xc
                (0, assert_1.assert)(false);
                return [2 /*return*/];
            });
        });
    };
    ListNode.prototype.refreshValue = function () { };
    ListNode.prototype.getPagination = function () {
        return this.pagination;
    };
    ListNode.prototype.setPagination = function (pagination) {
        var newPagination = Object.assign(this.pagination, pagination);
        this.pagination = newPagination;
    };
    ListNode.prototype.getChild = function (path, newBorn) {
        var idx = parseInt(path, 10);
        (0, assert_1.assert)(typeof idx === 'number');
        if (idx < this.children.length) {
            return this.children[idx];
        }
        else {
            var idx2 = idx - this.children.length;
            // assert(idx2 < this.newBorn.length);  // 在删除结点时可能还是会跑到
            if (this.newBorn[idx2]) {
                return this.newBorn[idx2];
            }
            else if (newBorn) {
                this.newBorn[idx2] = new SingleNode(this.entity, this.schema, this.cache, this.projection, this.projectionShape, this, 'create');
                return this.newBorn[idx2];
            }
        }
    };
    ListNode.prototype.getChildren = function () {
        return this.children;
    };
    ListNode.prototype.getNewBorn = function () {
        return this.newBorn;
    };
    /*  addChild(path: string, node: SingleNode<ED, T, Cxt, AD>) {
         const idx = parseInt(path, 10);
         assert(typeof idx === 'number');
         this.children[idx] = node;
     } */
    ListNode.prototype.removeChild = function (path) {
        var idx = parseInt(path, 10);
        (0, assert_1.assert)(typeof idx === 'number');
        this.children.splice(idx, 1);
    };
    ListNode.prototype.setValue = function (value) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var _a;
            var _this = this;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        this.children = [];
                        _a = value;
                        if (!_a) return [3 /*break*/, 2];
                        return [4 /*yield*/, Promise.all(value.map(function (ele, idx) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                                var node;
                                return tslib_1.__generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            node = new SingleNode(this.entity, this.schema, this.cache, this.projection, this.projectionShape, this);
                                            this.children[idx] = node;
                                            return [4 /*yield*/, node.setValue(ele)];
                                        case 1:
                                            _a.sent();
                                            return [2 /*return*/];
                                    }
                                });
                            }); }))];
                    case 1:
                        _a = (_b.sent());
                        _b.label = 2;
                    case 2:
                        _a;
                        return [2 /*return*/];
                }
            });
        });
    };
    ListNode.prototype.appendValue = function (value) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var _a;
            var _this = this;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = value;
                        if (!_a) return [3 /*break*/, 2];
                        return [4 /*yield*/, Promise.all(value.map(function (ele, idx) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                                var node;
                                return tslib_1.__generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            node = new SingleNode(this.entity, this.schema, this.cache, this.projection, this.projectionShape, this);
                                            this.children[this.children.length + idx] = node;
                                            return [4 /*yield*/, node.setValue(ele)];
                                        case 1:
                                            _a.sent();
                                            return [2 /*return*/];
                                    }
                                });
                            }); }))];
                    case 1:
                        _a = (_b.sent());
                        _b.label = 2;
                    case 2:
                        _a;
                        return [2 /*return*/];
                }
            });
        });
    };
    ListNode.prototype.getNamedFilters = function () {
        return this.filters;
    };
    ListNode.prototype.getNamedFilterByName = function (name) {
        var filter = this.filters.find(function (ele) { return ele['#name'] === name; });
        return filter;
    };
    ListNode.prototype.setNamedFilters = function (filters) {
        this.filters = filters;
    };
    ListNode.prototype.addNamedFilter = function (filter) {
        // filter 根据#name查找
        var fIndex = this.filters.findIndex(function (ele) { return filter['#name'] && ele['#name'] === filter['#name']; });
        if (fIndex >= 0) {
            this.filters.splice(fIndex, 1, filter);
        }
        else {
            this.filters.push(filter);
        }
    };
    ListNode.prototype.removeNamedFilter = function (filter) {
        // filter 根据#name查找
        var fIndex = this.filters.findIndex(function (ele) { return filter['#name'] && ele['#name'] === filter['#name']; });
        if (fIndex >= 0) {
            this.filters.splice(fIndex, 1);
        }
    };
    ListNode.prototype.removeNamedFilterByName = function (name) {
        // filter 根据#name查找
        var fIndex = this.filters.findIndex(function (ele) { return ele['#name'] === name; });
        if (fIndex >= 0) {
            this.filters.splice(fIndex, 1);
        }
    };
    ListNode.prototype.getNamedSorters = function () {
        return this.sorters;
    };
    ListNode.prototype.getNamedSorterByName = function (name) {
        var sorter = this.sorters.find(function (ele) { return ele['#name'] === name; });
        return sorter;
    };
    ListNode.prototype.setNamedSorters = function (sorters) {
        this.sorters = sorters;
    };
    ListNode.prototype.addNamedSorter = function (sorter) {
        // sorter 根据#name查找
        var fIndex = this.sorters.findIndex(function (ele) { return sorter['#name'] && ele['#name'] === sorter['#name']; });
        if (fIndex >= 0) {
            this.sorters.splice(fIndex, 1, sorter);
        }
        else {
            this.sorters.push(sorter);
        }
    };
    ListNode.prototype.removeNamedSorter = function (sorter) {
        // sorter 根据#name查找
        var fIndex = this.sorters.findIndex(function (ele) { return sorter['#name'] && ele['#name'] === sorter['#name']; });
        if (fIndex >= 0) {
            this.sorters.splice(fIndex, 1);
        }
    };
    ListNode.prototype.removeNamedSorterByName = function (name) {
        // sorter 根据#name查找
        var fIndex = this.sorters.findIndex(function (ele) { return ele['#name'] === name; });
        if (fIndex >= 0) {
            this.sorters.splice(fIndex, 1);
        }
    };
    ListNode.prototype.getFreshValue = function () {
        var _this = this;
        var value = this.children
            .map(function (ele) { return ele.getFreshValue(); })
            .concat(this.newBorn.map(function (ele) { return ele.getFreshValue(); }))
            .filter(function (ele) { return !!ele; });
        if (this.isDirty()) {
            var action = this.action || 'update';
            if (action === 'remove') {
                return []; // 这个可能跑到吗？
            }
            return value.map(function (ele) { return Object.assign({}, ele, _this.updateData); });
        }
        else {
            return value;
        }
    };
    ListNode.prototype.getAction = function () {
        (0, assert_1.assert)(this.isDirty());
        return this.action || 'update';
    };
    ListNode.prototype.composeOperation = function (action, execute) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var actions, _a, _b, node, subAction, e_3_1, _c, _d, node, subAction, e_4_1;
            var e_3, _e, e_4, _f;
            return tslib_1.__generator(this, function (_g) {
                switch (_g.label) {
                    case 0:
                        if (!this.isDirty()) {
                            if (action) {
                                (0, assert_1.assert)(action === 'create'); // 在list页面测试create是否允许？
                                return [2 /*return*/, {
                                        id: 'dummy',
                                        action: action,
                                        data: {},
                                    }];
                            }
                            return [2 /*return*/];
                        }
                        // todo 这里的逻辑还没有测试过，后面还有ids选择的Case
                        if (this.action) {
                            return [2 /*return*/, {
                                    id: this.dirty,
                                    action: this.getAction(),
                                    data: (0, lodash_1.cloneDeep)(this.updateData),
                                    filter: (0, filter_1.combineFilters)(this.filters.map(function (ele) { return ele.filter; })),
                                }]; // todo 这里以后再增加对选中id的过滤
                        }
                        actions = [];
                        _g.label = 1;
                    case 1:
                        _g.trys.push([1, 6, 7, 8]);
                        _a = tslib_1.__values(this.children), _b = _a.next();
                        _g.label = 2;
                    case 2:
                        if (!!_b.done) return [3 /*break*/, 5];
                        node = _b.value;
                        return [4 /*yield*/, node.composeOperation(undefined, execute)];
                    case 3:
                        subAction = _g.sent();
                        if (subAction) {
                            // 如果有action，这里用action代替默认的update。userRelation/onEntity页面可以测到
                            if (action) {
                                Object.assign(subAction, {
                                    action: action,
                                });
                            }
                            actions.push(subAction);
                        }
                        _g.label = 4;
                    case 4:
                        _b = _a.next();
                        return [3 /*break*/, 2];
                    case 5: return [3 /*break*/, 8];
                    case 6:
                        e_3_1 = _g.sent();
                        e_3 = { error: e_3_1 };
                        return [3 /*break*/, 8];
                    case 7:
                        try {
                            if (_b && !_b.done && (_e = _a.return)) _e.call(_a);
                        }
                        finally { if (e_3) throw e_3.error; }
                        return [7 /*endfinally*/];
                    case 8:
                        _g.trys.push([8, 13, 14, 15]);
                        _c = tslib_1.__values(this.newBorn), _d = _c.next();
                        _g.label = 9;
                    case 9:
                        if (!!_d.done) return [3 /*break*/, 12];
                        node = _d.value;
                        return [4 /*yield*/, node.composeOperation(undefined, execute)];
                    case 10:
                        subAction = _g.sent();
                        if (subAction) {
                            // assert(!action || action === 'create'); // 如果还有新建，应该不会有其它类型的action
                            actions.push(subAction);
                        }
                        _g.label = 11;
                    case 11:
                        _d = _c.next();
                        return [3 /*break*/, 9];
                    case 12: return [3 /*break*/, 15];
                    case 13:
                        e_4_1 = _g.sent();
                        e_4 = { error: e_4_1 };
                        return [3 /*break*/, 15];
                    case 14:
                        try {
                            if (_d && !_d.done && (_f = _c.return)) _f.call(_c);
                        }
                        finally { if (e_4) throw e_4.error; }
                        return [7 /*endfinally*/];
                    case 15: return [2 /*return*/, actions];
                }
            });
        });
    };
    ListNode.prototype.refresh = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var _a, filters, sorters, pagination, entity, pageSize, proj, sorterArr, filterArr, currentPage, _b, data, count;
            var _this = this;
            return tslib_1.__generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _a = this, filters = _a.filters, sorters = _a.sorters, pagination = _a.pagination, entity = _a.entity;
                        pageSize = pagination.pageSize;
                        return [4 /*yield*/, this.getProjection()];
                    case 1:
                        proj = _c.sent();
                        (0, assert_1.assert)(proj, "取数据时找不到projection信息");
                        return [4 /*yield*/, Promise.all(sorters.map(function (ele) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                                var sorter;
                                return tslib_1.__generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            sorter = ele.sorter;
                                            if (!(typeof sorter === 'function')) return [3 /*break*/, 2];
                                            return [4 /*yield*/, sorter()];
                                        case 1: return [2 /*return*/, _a.sent()];
                                        case 2: return [2 /*return*/, sorter];
                                    }
                                });
                            }); }))];
                    case 2:
                        sorterArr = (_c.sent()).filter(function (ele) { return !!ele; });
                        return [4 /*yield*/, Promise.all(filters.map(function (ele) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                                var filter;
                                return tslib_1.__generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            filter = ele.filter;
                                            if (!(typeof filter === 'function')) return [3 /*break*/, 2];
                                            return [4 /*yield*/, filter()];
                                        case 1: return [2 /*return*/, _a.sent()];
                                        case 2: return [2 /*return*/, filter];
                                    }
                                });
                            }); }))];
                    case 3:
                        filterArr = _c.sent();
                        this.refreshing = true;
                        currentPage = 1;
                        return [4 /*yield*/, this.cache.refresh(entity, {
                                data: proj,
                                filter: filterArr.length > 0
                                    ? (0, filter_1.combineFilters)(filterArr.filter(function (ele) { return !!ele; }))
                                    : undefined,
                                sorter: sorterArr,
                                indexFrom: (currentPage - 1) * pageSize,
                                count: pageSize,
                            }, undefined, true)];
                    case 4:
                        _b = _c.sent(), data = _b.data, count = _b.count;
                        this.pagination.currentPage = currentPage;
                        this.pagination.more = data.length === pageSize;
                        this.refreshing = false;
                        this.pagination.total = count;
                        return [4 /*yield*/, this.setValue(data)];
                    case 5:
                        _c.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    ListNode.prototype.loadMore = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var _a, filters, sorters, pagination, entity, pageSize, more, currentPage, proj, sorterArr, filterArr, currentPage2, data;
            var _this = this;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = this, filters = _a.filters, sorters = _a.sorters, pagination = _a.pagination, entity = _a.entity;
                        pageSize = pagination.pageSize, more = pagination.more, currentPage = pagination.currentPage;
                        if (!more) {
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, this.getProjection()];
                    case 1:
                        proj = _b.sent();
                        (0, assert_1.assert)(proj);
                        return [4 /*yield*/, Promise.all(sorters.map(function (ele) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                                var sorter;
                                return tslib_1.__generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            sorter = ele.sorter;
                                            if (!(typeof sorter === 'function')) return [3 /*break*/, 2];
                                            return [4 /*yield*/, sorter()];
                                        case 1: return [2 /*return*/, _a.sent()];
                                        case 2: return [2 /*return*/, sorter];
                                    }
                                });
                            }); }))];
                    case 2:
                        sorterArr = (_b.sent()).filter(function (ele) { return !!ele; });
                        return [4 /*yield*/, Promise.all(filters.map(function (ele) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                                var filter;
                                return tslib_1.__generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            filter = ele.filter;
                                            if (!(typeof filter === 'function')) return [3 /*break*/, 2];
                                            return [4 /*yield*/, filter()];
                                        case 1: return [2 /*return*/, _a.sent()];
                                        case 2: return [2 /*return*/, filter];
                                    }
                                });
                            }); }))];
                    case 3:
                        filterArr = _b.sent();
                        this.refreshing = true;
                        currentPage2 = currentPage + 1;
                        return [4 /*yield*/, this.cache.refresh(entity, {
                                data: proj,
                                filter: filterArr.length > 0
                                    ? (0, filter_1.combineFilters)(filterArr.filter(function (ele) { return !!ele; }))
                                    : undefined,
                                sorter: sorterArr,
                                indexFrom: (currentPage2 - 1) * pageSize,
                                count: pageSize,
                            })];
                    case 4:
                        data = (_b.sent()).data;
                        this.pagination.currentPage = currentPage2;
                        this.pagination.more = data.length === pageSize;
                        this.refreshing = false;
                        this.appendValue(data);
                        return [2 /*return*/];
                }
            });
        });
    };
    ListNode.prototype.setCurrentPage = function (currentPage, append) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var _a, filters, sorters, pagination, entity, pageSize, proj, sorterArr, filterArr, data;
            var _this = this;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = this, filters = _a.filters, sorters = _a.sorters, pagination = _a.pagination, entity = _a.entity;
                        pageSize = pagination.pageSize;
                        return [4 /*yield*/, this.getProjection()];
                    case 1:
                        proj = _b.sent();
                        (0, assert_1.assert)(proj);
                        return [4 /*yield*/, Promise.all(sorters.map(function (ele) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                                var sorter;
                                return tslib_1.__generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            sorter = ele.sorter;
                                            if (!(typeof sorter === 'function')) return [3 /*break*/, 2];
                                            return [4 /*yield*/, sorter()];
                                        case 1: return [2 /*return*/, _a.sent()];
                                        case 2: return [2 /*return*/, sorter];
                                    }
                                });
                            }); }))];
                    case 2:
                        sorterArr = (_b.sent()).filter(function (ele) { return !!ele; });
                        return [4 /*yield*/, Promise.all(filters.map(function (ele) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                                var filter;
                                return tslib_1.__generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            filter = ele.filter;
                                            if (!(typeof filter === 'function')) return [3 /*break*/, 2];
                                            return [4 /*yield*/, filter()];
                                        case 1: return [2 /*return*/, _a.sent()];
                                        case 2: return [2 /*return*/, filter];
                                    }
                                });
                            }); }))];
                    case 3:
                        filterArr = _b.sent();
                        this.refreshing = true;
                        return [4 /*yield*/, this.cache.refresh(entity, {
                                data: proj,
                                filter: filterArr.length > 0
                                    ? (0, filter_1.combineFilters)(filterArr.filter(function (ele) { return !!ele; }))
                                    : undefined,
                                sorter: sorterArr,
                                indexFrom: (currentPage - 1) * pageSize,
                                count: pageSize,
                            })];
                    case 4:
                        data = (_b.sent()).data;
                        this.pagination.currentPage = currentPage;
                        this.pagination.more = data.length === pageSize;
                        this.refreshing = false;
                        if (!append) return [3 /*break*/, 5];
                        this.appendValue(data);
                        return [3 /*break*/, 7];
                    case 5: return [4 /*yield*/, this.setValue(data)];
                    case 6:
                        _b.sent();
                        _b.label = 7;
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    ListNode.prototype.resetUpdateData = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var _a, _b, child, e_5_1;
            var e_5, _c;
            return tslib_1.__generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        this.updateData = {};
                        this.action = undefined;
                        this.dirty = undefined;
                        _d.label = 1;
                    case 1:
                        _d.trys.push([1, 6, 7, 8]);
                        _a = tslib_1.__values(this.children), _b = _a.next();
                        _d.label = 2;
                    case 2:
                        if (!!_b.done) return [3 /*break*/, 5];
                        child = _b.value;
                        return [4 /*yield*/, child.resetUpdateData()];
                    case 3:
                        _d.sent();
                        _d.label = 4;
                    case 4:
                        _b = _a.next();
                        return [3 /*break*/, 2];
                    case 5: return [3 /*break*/, 8];
                    case 6:
                        e_5_1 = _d.sent();
                        e_5 = { error: e_5_1 };
                        return [3 /*break*/, 8];
                    case 7:
                        try {
                            if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
                        }
                        finally { if (e_5) throw e_5.error; }
                        return [7 /*endfinally*/];
                    case 8:
                        this.newBorn = [];
                        return [2 /*return*/];
                }
            });
        });
    };
    ListNode.prototype.pushNewBorn = function (options) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var updateData, beforeExecute, afterExecute, node;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        updateData = options.updateData, beforeExecute = options.beforeExecute, afterExecute = options.afterExecute;
                        node = new SingleNode(this.entity, this.schema, this.cache, this.projection, this.projectionShape, this, 'create');
                        if (!updateData) return [3 /*break*/, 2];
                        return [4 /*yield*/, node.setMultiUpdateData(updateData)];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        if (beforeExecute) {
                            node.setBeforeExecute(beforeExecute);
                        }
                        if (afterExecute) {
                            node.setAfterExecute(afterExecute);
                        }
                        this.newBorn.push(node);
                        return [2 /*return*/, node];
                }
            });
        });
    };
    ListNode.prototype.popNewBorn = function (path) {
        var index = parseInt(path, 10);
        (0, assert_1.assert)(typeof index === 'number' && index >= this.children.length);
        var index2 = index - this.children.length;
        (0, assert_1.assert)(index2 < this.newBorn.length);
        this.newBorn.splice(index2, 1);
    };
    /**
     * 判断传入的updateData和当前的某项是否相等
     * @param from 当前项
     * @param to 传入项
     * @returns
     */
    ListNode.prototype.judgeTheSame = function (from, to) {
        if (!from) {
            return false;
        }
        for (var attr in to) {
            if (from[attr] !== to[attr]) {
                return false;
            }
        }
        return true;
    };
    // 将本结点的freshValue更正成data的要求，其中updateData要和现有的数据去重
    ListNode.prototype.setUniqueChildren = function (data) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var convertForeignKey, uds, data_1, data_1_1, dt, existed, updateData, ud2, _a, _b, child, e_6_1, _c, _d, child, e_7_1, _e, _f, child, included, uds_1, uds_1_1, ud, e_8_1, newBorn2, _g, _h, child, uds_2, uds_2_1, ud;
            var e_7, _j, e_6, _k, e_9, _l, e_8, _m, e_10, _o, e_11, _p, e_12, _q;
            var _this = this;
            return tslib_1.__generator(this, function (_r) {
                switch (_r.label) {
                    case 0:
                        convertForeignKey = function (origin) {
                            var _a, _b;
                            var result = {};
                            for (var attr in origin) {
                                var rel = _this.judgeRelation(attr);
                                if (rel === 2) {
                                    Object.assign(result, {
                                        entity: attr,
                                        entityId: origin[attr],
                                    });
                                }
                                else if (typeof rel === 'string') {
                                    Object.assign(result, (_a = {},
                                        _a["".concat(attr, "Id")] = origin[attr],
                                        _a));
                                }
                                else {
                                    (0, assert_1.assert)(rel === 1);
                                    Object.assign(result, (_b = {},
                                        _b[attr] = origin[attr],
                                        _b));
                                }
                            }
                            return result;
                        };
                        uds = [];
                        _r.label = 1;
                    case 1:
                        _r.trys.push([1, 15, 16, 17]);
                        data_1 = tslib_1.__values(data), data_1_1 = data_1.next();
                        _r.label = 2;
                    case 2:
                        if (!!data_1_1.done) return [3 /*break*/, 14];
                        dt = data_1_1.value;
                        existed = false;
                        updateData = dt.updateData;
                        ud2 = convertForeignKey(updateData);
                        uds.push(ud2);
                        _r.label = 3;
                    case 3:
                        _r.trys.push([3, 9, 10, 11]);
                        _a = (e_6 = void 0, tslib_1.__values(this.children)), _b = _a.next();
                        _r.label = 4;
                    case 4:
                        if (!!_b.done) return [3 /*break*/, 8];
                        child = _b.value;
                        if (!this.judgeTheSame(child.getFreshValue(true), ud2)) return [3 /*break*/, 7];
                        if (!(child.getAction() === 'remove')) return [3 /*break*/, 6];
                        // 这里把updateData全干掉了，如果本身是先update再remove或许会有问题 by Xc
                        return [4 /*yield*/, child.resetUpdateData()];
                    case 5:
                        // 这里把updateData全干掉了，如果本身是先update再remove或许会有问题 by Xc
                        _r.sent();
                        _r.label = 6;
                    case 6:
                        existed = true;
                        return [3 /*break*/, 8];
                    case 7:
                        _b = _a.next();
                        return [3 /*break*/, 4];
                    case 8: return [3 /*break*/, 11];
                    case 9:
                        e_6_1 = _r.sent();
                        e_6 = { error: e_6_1 };
                        return [3 /*break*/, 11];
                    case 10:
                        try {
                            if (_b && !_b.done && (_k = _a.return)) _k.call(_a);
                        }
                        finally { if (e_6) throw e_6.error; }
                        return [7 /*endfinally*/];
                    case 11:
                        try {
                            for (_c = (e_9 = void 0, tslib_1.__values(this.newBorn)), _d = _c.next(); !_d.done; _d = _c.next()) {
                                child = _d.value;
                                if (this.judgeTheSame(child.getFreshValue(true), ud2)) {
                                    existed = true;
                                    break;
                                }
                            }
                        }
                        catch (e_9_1) { e_9 = { error: e_9_1 }; }
                        finally {
                            try {
                                if (_d && !_d.done && (_l = _c.return)) _l.call(_c);
                            }
                            finally { if (e_9) throw e_9.error; }
                        }
                        if (!!existed) return [3 /*break*/, 13];
                        // 如果不存在，就生成newBorn
                        return [4 /*yield*/, this.pushNewBorn(dt)];
                    case 12:
                        // 如果不存在，就生成newBorn
                        _r.sent();
                        _r.label = 13;
                    case 13:
                        data_1_1 = data_1.next();
                        return [3 /*break*/, 2];
                    case 14: return [3 /*break*/, 17];
                    case 15:
                        e_7_1 = _r.sent();
                        e_7 = { error: e_7_1 };
                        return [3 /*break*/, 17];
                    case 16:
                        try {
                            if (data_1_1 && !data_1_1.done && (_j = data_1.return)) _j.call(data_1);
                        }
                        finally { if (e_7) throw e_7.error; }
                        return [7 /*endfinally*/];
                    case 17:
                        _r.trys.push([17, 22, 23, 24]);
                        _e = tslib_1.__values(this.children), _f = _e.next();
                        _r.label = 18;
                    case 18:
                        if (!!_f.done) return [3 /*break*/, 21];
                        child = _f.value;
                        included = false;
                        try {
                            for (uds_1 = (e_10 = void 0, tslib_1.__values(uds)), uds_1_1 = uds_1.next(); !uds_1_1.done; uds_1_1 = uds_1.next()) {
                                ud = uds_1_1.value;
                                if (this.judgeTheSame(child.getFreshValue(true), ud)) {
                                    included = true;
                                    break;
                                }
                            }
                        }
                        catch (e_10_1) { e_10 = { error: e_10_1 }; }
                        finally {
                            try {
                                if (uds_1_1 && !uds_1_1.done && (_o = uds_1.return)) _o.call(uds_1);
                            }
                            finally { if (e_10) throw e_10.error; }
                        }
                        if (!!included) return [3 /*break*/, 20];
                        return [4 /*yield*/, child.setAction('remove')];
                    case 19:
                        _r.sent();
                        _r.label = 20;
                    case 20:
                        _f = _e.next();
                        return [3 /*break*/, 18];
                    case 21: return [3 /*break*/, 24];
                    case 22:
                        e_8_1 = _r.sent();
                        e_8 = { error: e_8_1 };
                        return [3 /*break*/, 24];
                    case 23:
                        try {
                            if (_f && !_f.done && (_m = _e.return)) _m.call(_e);
                        }
                        finally { if (e_8) throw e_8.error; }
                        return [7 /*endfinally*/];
                    case 24:
                        newBorn2 = [];
                        try {
                            for (_g = tslib_1.__values(this.newBorn), _h = _g.next(); !_h.done; _h = _g.next()) {
                                child = _h.value;
                                try {
                                    for (uds_2 = (e_12 = void 0, tslib_1.__values(uds)), uds_2_1 = uds_2.next(); !uds_2_1.done; uds_2_1 = uds_2.next()) {
                                        ud = uds_2_1.value;
                                        if (this.judgeTheSame(child.getFreshValue(true), ud)) {
                                            newBorn2.push(child);
                                            break;
                                        }
                                    }
                                }
                                catch (e_12_1) { e_12 = { error: e_12_1 }; }
                                finally {
                                    try {
                                        if (uds_2_1 && !uds_2_1.done && (_q = uds_2.return)) _q.call(uds_2);
                                    }
                                    finally { if (e_12) throw e_12.error; }
                                }
                            }
                        }
                        catch (e_11_1) { e_11 = { error: e_11_1 }; }
                        finally {
                            try {
                                if (_h && !_h.done && (_p = _g.return)) _p.call(_g);
                            }
                            finally { if (e_11) throw e_11.error; }
                        }
                        this.newBorn = newBorn2;
                        return [2 /*return*/];
                }
            });
        });
    };
    ListNode.prototype.toggleChild = function (data, checked) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var updateData, _a, _b, child, e_13_1, _c, _d, child, e_14_1, _e, _f, child;
            var e_13, _g, e_14, _h, e_15, _j;
            return tslib_1.__generator(this, function (_k) {
                switch (_k.label) {
                    case 0:
                        updateData = data.updateData;
                        if (!checked) return [3 /*break*/, 10];
                        _k.label = 1;
                    case 1:
                        _k.trys.push([1, 6, 7, 8]);
                        _a = tslib_1.__values(this.children), _b = _a.next();
                        _k.label = 2;
                    case 2:
                        if (!!_b.done) return [3 /*break*/, 5];
                        child = _b.value;
                        if (!this.judgeTheSame(child.getFreshValue(true), updateData)) return [3 /*break*/, 4];
                        (0, assert_1.assert)(child.getAction() === 'remove');
                        // 这里把updateData全干掉了，如果本身是先update再remove或许会有问题 by Xc
                        return [4 /*yield*/, child.resetUpdateData()];
                    case 3:
                        // 这里把updateData全干掉了，如果本身是先update再remove或许会有问题 by Xc
                        _k.sent();
                        return [2 /*return*/];
                    case 4:
                        _b = _a.next();
                        return [3 /*break*/, 2];
                    case 5: return [3 /*break*/, 8];
                    case 6:
                        e_13_1 = _k.sent();
                        e_13 = { error: e_13_1 };
                        return [3 /*break*/, 8];
                    case 7:
                        try {
                            if (_b && !_b.done && (_g = _a.return)) _g.call(_a);
                        }
                        finally { if (e_13) throw e_13.error; }
                        return [7 /*endfinally*/];
                    case 8: return [4 /*yield*/, this.pushNewBorn(data)];
                    case 9:
                        _k.sent();
                        return [3 /*break*/, 18];
                    case 10:
                        _k.trys.push([10, 15, 16, 17]);
                        _c = tslib_1.__values(this.children), _d = _c.next();
                        _k.label = 11;
                    case 11:
                        if (!!_d.done) return [3 /*break*/, 14];
                        child = _d.value;
                        if (!this.judgeTheSame(child.getFreshValue(true), updateData)) return [3 /*break*/, 13];
                        (0, assert_1.assert)(child.getAction() !== 'remove');
                        // 这里把updateData全干掉了，如果本身是先update再remove或许会有问题 by Xc
                        return [4 /*yield*/, child.setAction('remove')];
                    case 12:
                        // 这里把updateData全干掉了，如果本身是先update再remove或许会有问题 by Xc
                        _k.sent();
                        return [2 /*return*/];
                    case 13:
                        _d = _c.next();
                        return [3 /*break*/, 11];
                    case 14: return [3 /*break*/, 17];
                    case 15:
                        e_14_1 = _k.sent();
                        e_14 = { error: e_14_1 };
                        return [3 /*break*/, 17];
                    case 16:
                        try {
                            if (_d && !_d.done && (_h = _c.return)) _h.call(_c);
                        }
                        finally { if (e_14) throw e_14.error; }
                        return [7 /*endfinally*/];
                    case 17:
                        try {
                            for (_e = tslib_1.__values(this.newBorn), _f = _e.next(); !_f.done; _f = _e.next()) {
                                child = _f.value;
                                if (this.judgeTheSame(child.getFreshValue(true), updateData)) {
                                    (0, lodash_1.pull)(this.newBorn, child);
                                    return [2 /*return*/];
                                }
                            }
                        }
                        catch (e_15_1) { e_15 = { error: e_15_1 }; }
                        finally {
                            try {
                                if (_f && !_f.done && (_j = _e.return)) _j.call(_e);
                            }
                            finally { if (e_15) throw e_15.error; }
                        }
                        (0, assert_1.assert)(false, 'toggle动作的remove对象没有找到对应的子结点');
                        _k.label = 18;
                    case 18: return [2 /*return*/];
                }
            });
        });
    };
    return ListNode;
}(Node));
var SingleNode = /** @class */ (function (_super) {
    tslib_1.__extends(SingleNode, _super);
    function SingleNode(entity, schema, cache, projection, projectionShape, parent, action, updateData) {
        var _this = _super.call(this, entity, schema, cache, projection, parent, action, updateData) || this;
        _this.children = {};
        var ownKeys = [];
        var attrs = Object.keys(projectionShape);
        var toModi = schema[entity].toModi;
        attrs.forEach(function (attr) {
            var _a, _b, _c, _d, _e, _f;
            var proj = typeof projection === 'function' ? function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                var projection2;
                return tslib_1.__generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, projection()];
                        case 1:
                            projection2 = _a.sent();
                            return [2 /*return*/, projection2[attr]];
                    }
                });
            }); } : projection[attr];
            var rel = _this.judgeRelation(attr);
            if (rel === 2) {
                var node = new SingleNode(attr, _this.schema, _this.cache, proj, projectionShape[attr], _this);
                Object.assign(_this.children, (_a = {},
                    _a[attr] = node,
                    _a));
                if (toModi && attr !== 'modi$entity') {
                    var node2 = new SingleNode(attr, _this.schema, _this.cache, proj, projectionShape[attr], _this);
                    Object.assign(_this.children, (_b = {},
                        _b["".concat(attr, ":prev")] = node2,
                        _b));
                }
            }
            else if (typeof rel === 'string') {
                var node = new SingleNode(rel, _this.schema, _this.cache, proj, projectionShape[attr], _this);
                Object.assign(_this.children, (_c = {},
                    _c[attr] = node,
                    _c));
                if (toModi && attr !== 'modi$entity') {
                    var node2 = new SingleNode(attr, _this.schema, _this.cache, proj, projectionShape[attr], _this);
                    Object.assign(_this.children, (_d = {},
                        _d["".concat(attr, ":prev")] = node2,
                        _d));
                }
            }
            else if (typeof rel === 'object' && rel instanceof Array) {
                var subProjectionShape = projectionShape[attr].data;
                var proj_1 = typeof projection === 'function' ? function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                    var projection2;
                    return tslib_1.__generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, projection()];
                            case 1:
                                projection2 = _a.sent();
                                return [2 /*return*/, projection2[attr].data];
                        }
                    });
                }); } : projection[attr].data;
                var filter = typeof projection === 'function' ? function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                    var projection2;
                    return tslib_1.__generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, projection()];
                            case 1:
                                projection2 = _a.sent();
                                return [2 /*return*/, projection2[attr].filter];
                        }
                    });
                }); } : projection[attr].filter;
                var sorters = typeof projection === 'function' ? function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                    var projection2;
                    return tslib_1.__generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, projection()];
                            case 1:
                                projection2 = _a.sent();
                                return [2 /*return*/, projection2[attr].sorter];
                        }
                    });
                }); } : projection[attr].sorter;
                var node_1 = new ListNode(rel[0], _this.schema, _this.cache, proj_1, subProjectionShape, _this);
                if (filter) {
                    node_1.addNamedFilter({
                        filter: filter,
                    });
                }
                if (sorters && sorters instanceof Array) {
                    // todo 没有处理projection是一个function的case
                    sorters.forEach(function (ele) { return node_1.addNamedSorter({
                        sorter: ele
                    }); });
                }
                Object.assign(_this.children, (_e = {},
                    _e[attr] = node_1,
                    _e));
                if (toModi && attr !== 'modi$entity') {
                    var node2_1 = new ListNode(rel[0], _this.schema, _this.cache, proj_1, subProjectionShape, _this);
                    if (filter) {
                        node2_1.addNamedFilter({
                            filter: filter,
                        });
                    }
                    if (sorters && sorters instanceof Array) {
                        // todo 没有处理projection是一个function的case
                        sorters.forEach(function (ele) { return node2_1.addNamedSorter({
                            sorter: ele
                        }); });
                    }
                    Object.assign(_this.children, (_f = {},
                        _f["".concat(attr, ":prev")] = node2_1,
                        _f));
                }
            }
            else {
                ownKeys.push(attr);
            }
        });
        return _this;
    }
    SingleNode.prototype.onCacheSync = function (records) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var needReGetValue, records_2, records_2_1, record, a, _a, e, d, _b, e, f, d, e, id, projection, _c, _d, value;
            var e_16, _e;
            var _this = this;
            return tslib_1.__generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        needReGetValue = false;
                        if (this.refreshing || !this.id) {
                            return [2 /*return*/];
                        }
                        try {
                            for (records_2 = tslib_1.__values(records), records_2_1 = records_2.next(); !records_2_1.done; records_2_1 = records_2.next()) {
                                record = records_2_1.value;
                                if (needReGetValue === true) {
                                    break;
                                }
                                a = record.a;
                                switch (a) {
                                    case 'c': {
                                        _a = record, e = _a.e, d = _a.d;
                                        if (e === this.entity) {
                                            if (d instanceof Array) {
                                                if (d.find(function (dd) { return dd.id === _this.id; })) {
                                                    needReGetValue = true;
                                                }
                                            }
                                            else if (d.id === this.id) {
                                                // this.id应该是通过父结点来设置到子结点上
                                                needReGetValue = true;
                                            }
                                        }
                                        break;
                                    }
                                    case 'r':
                                    case 'u': {
                                        _b = record, e = _b.e, f = _b.f;
                                        if (e === this.entity) {
                                            // todo 这里更严格应该考虑f对当前filter有无影响，同上面一样这里可能没有完整的供f用的cache数据
                                            if (!this.repel(f || {}, {
                                                id: this.id,
                                            })) {
                                                needReGetValue = true;
                                            }
                                        }
                                        break;
                                    }
                                    case 's': {
                                        d = record.d;
                                        for (e in d) {
                                            if (needReGetValue === true) {
                                                break;
                                            }
                                            if (e === this.entity) {
                                                for (id in d[e]) {
                                                    if (this.id === id) {
                                                        needReGetValue = true;
                                                        break;
                                                    }
                                                }
                                            }
                                        }
                                        break;
                                    }
                                }
                            }
                        }
                        catch (e_16_1) { e_16 = { error: e_16_1 }; }
                        finally {
                            try {
                                if (records_2_1 && !records_2_1.done && (_e = records_2.return)) _e.call(records_2);
                            }
                            finally { if (e_16) throw e_16.error; }
                        }
                        if (!needReGetValue) return [3 /*break*/, 6];
                        if (!(typeof this.projection === 'function')) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.projection()];
                    case 1:
                        _c = _f.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        _c = this.projection;
                        _f.label = 3;
                    case 3:
                        projection = _c;
                        return [4 /*yield*/, this.cache.get(this.entity, {
                                data: projection,
                                filter: {
                                    id: this.id,
                                }
                            })];
                    case 4:
                        _d = tslib_1.__read.apply(void 0, [_f.sent(), 1]), value = _d[0];
                        return [4 /*yield*/, this.setValue(value)];
                    case 5:
                        _f.sent();
                        _f.label = 6;
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    SingleNode.prototype.destroy = function () {
        _super.prototype.destroy.call(this);
        for (var k in this.children) {
            this.children[k].destroy();
        }
    };
    SingleNode.prototype.getChild = function (path) {
        return this.children[path];
    };
    SingleNode.prototype.getChildren = function () {
        return this.children;
    };
    SingleNode.prototype.removeChild = function (path) {
        (0, lodash_1.unset)(this.children, path);
    };
    SingleNode.prototype.refreshValue = function () {
        var action = this.action || (this.isDirty() ? 'update' : '');
        if (!action) {
            this.freshValue = this.value;
        }
        else {
            if (action === 'remove') {
                this.freshValue = undefined;
            }
            else if (action === 'create') {
                this.freshValue = Object.assign({
                    id: (0, mockId_1.generateMockId)(),
                }, this.value, this.updateData);
            }
            else {
                this.freshValue = Object.assign({}, this.value, this.updateData);
            }
        }
    };
    SingleNode.prototype.setValue = function (value) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var value2, attrs, entityOperations, _a, projection, id, entity, projection2, _b, _c, value3, attr, attrs_1, attrs_1_1, attr, node, rel, filter, e_17_1;
            var _d, e_17, _e, _f;
            return tslib_1.__generator(this, function (_g) {
                switch (_g.label) {
                    case 0:
                        value2 = value && Object.assign({}, value);
                        this.id = value2 && value2.id;
                        attrs = Object.keys(this.children);
                        if (!attrs.includes('modi$entity')) return [3 /*break*/, 5];
                        if (!value2) return [3 /*break*/, 5];
                        if (!(value2.modi$entity && value2.modi$entity.length > 0)) return [3 /*break*/, 5];
                        entityOperations = (0, modi_1.createOperationsFromModies)(value2.modi$entity);
                        _a = this, projection = _a.projection, id = _a.id, entity = _a.entity;
                        if (!(typeof projection === 'function')) return [3 /*break*/, 2];
                        return [4 /*yield*/, projection()];
                    case 1:
                        _b = _g.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        _b = projection;
                        _g.label = 3;
                    case 3:
                        projection2 = _b;
                        return [4 /*yield*/, this.cache.tryRedoOperations(entity, {
                                data: projection2,
                                filter: {
                                    id: id,
                                },
                            }, entityOperations)];
                    case 4:
                        _c = tslib_1.__read.apply(void 0, [(_g.sent()).result, 1]), value3 = _c[0];
                        for (attr in value3) {
                            if (attr !== 'modi$entity' && this.children[attr]) {
                                // 如果有子结点，就用modi应用后的结点替代原来的结点，
                                Object.assign(value2, (_d = {},
                                    _d[attr] = value3[attr],
                                    _d["".concat(attr, ":prev")] = value2[attr],
                                    _d));
                            }
                        }
                        _g.label = 5;
                    case 5:
                        _g.trys.push([5, 12, 13, 14]);
                        attrs_1 = tslib_1.__values(attrs), attrs_1_1 = attrs_1.next();
                        _g.label = 6;
                    case 6:
                        if (!!attrs_1_1.done) return [3 /*break*/, 11];
                        attr = attrs_1_1.value;
                        node = this.children[attr];
                        if (!(value2 && value2[attr])) return [3 /*break*/, 8];
                        return [4 /*yield*/, node.setValue(value2[attr])];
                    case 7:
                        _g.sent();
                        if (node instanceof ListNode) {
                            rel = this.judgeRelation(attr);
                            (0, assert_1.assert)(rel instanceof Array);
                            filter = rel[1] ? (_f = {},
                                _f[rel[1]] = value2.id,
                                _f) : {
                                entityId: value2.id,
                            };
                            node.removeNamedFilterByName('inherent:parentId');
                            node.addNamedFilter({
                                filter: filter,
                                "#name": 'inherent:parentId',
                            });
                        }
                        return [3 /*break*/, 10];
                    case 8: return [4 /*yield*/, node.setValue(undefined)];
                    case 9:
                        _g.sent();
                        _g.label = 10;
                    case 10:
                        attrs_1_1 = attrs_1.next();
                        return [3 /*break*/, 6];
                    case 11: return [3 /*break*/, 14];
                    case 12:
                        e_17_1 = _g.sent();
                        e_17 = { error: e_17_1 };
                        return [3 /*break*/, 14];
                    case 13:
                        try {
                            if (attrs_1_1 && !attrs_1_1.done && (_e = attrs_1.return)) _e.call(attrs_1);
                        }
                        finally { if (e_17) throw e_17.error; }
                        return [7 /*endfinally*/];
                    case 14:
                        this.value = value2;
                        this.refreshValue();
                        return [2 /*return*/];
                }
            });
        });
    };
    SingleNode.prototype.getFreshValue = function (ignoreRemoved) {
        var _a;
        if (ignoreRemoved) {
            return Object.assign({}, this.value, this.updateData);
        }
        var freshValue = this.freshValue && (0, lodash_1.cloneDeep)(this.freshValue);
        if (freshValue) {
            for (var k in this.children) {
                Object.assign(freshValue, (_a = {},
                    _a[k] = this.children[k].getFreshValue(),
                    _a));
            }
        }
        return freshValue;
    };
    SingleNode.prototype.getAction = function () {
        return this.action || (this.id ? 'update' : 'create');
    };
    SingleNode.prototype.composeOperation = function (action2, execute) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var action, operation, _a, _b, _c, _d, _e, _f, _g, _i, attr, subAction;
            var _h, _j, _k;
            return tslib_1.__generator(this, function (_l) {
                switch (_l.label) {
                    case 0:
                        if (!action2 && !this.isDirty()) {
                            return [2 /*return*/];
                        }
                        action = action2 || this.getAction();
                        if (!(action === 'create')) return [3 /*break*/, 4];
                        _h = {
                            id: this.dirty,
                            action: 'create'
                        };
                        _c = (_b = Object).assign;
                        _d = [{}, this.updateData];
                        _j = {};
                        if (!execute) return [3 /*break*/, 2];
                        return [4 /*yield*/, generateNewId()];
                    case 1:
                        _e = _l.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        _e = (0, mockId_1.generateMockId)();
                        _l.label = 3;
                    case 3:
                        _a = (_h.data = _c.apply(_b, _d.concat([(_j.id = _e, _j)])),
                            _h);
                        return [3 /*break*/, 5];
                    case 4:
                        _a = {
                            id: this.dirty,
                            action: action,
                            data: (0, lodash_1.cloneDeep)(this.updateData),
                            filter: {
                                id: this.id,
                            },
                        };
                        _l.label = 5;
                    case 5:
                        operation = _a;
                        _f = [];
                        for (_g in this.children)
                            _f.push(_g);
                        _i = 0;
                        _l.label = 6;
                    case 6:
                        if (!(_i < _f.length)) return [3 /*break*/, 9];
                        attr = _f[_i];
                        return [4 /*yield*/, this.children[attr].composeOperation(undefined, execute)];
                    case 7:
                        subAction = _l.sent();
                        if (subAction) {
                            Object.assign(operation.data, (_k = {},
                                _k[attr] = subAction,
                                _k));
                        }
                        _l.label = 8;
                    case 8:
                        _i++;
                        return [3 /*break*/, 6];
                    case 9: return [2 /*return*/, operation];
                }
            });
        });
    };
    SingleNode.prototype.refresh = function (scene) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var projection, _a, value;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.getProjection()];
                    case 1:
                        projection = _b.sent();
                        if (!this.id) return [3 /*break*/, 4];
                        this.refreshing = true;
                        return [4 /*yield*/, this.cache.refresh(this.entity, {
                                data: projection,
                                filter: {
                                    id: this.id,
                                },
                            })];
                    case 2:
                        _a = tslib_1.__read.apply(void 0, [(_b.sent()).data, 1]), value = _a[0];
                        this.refreshing = false;
                        return [4 /*yield*/, this.setValue(value)];
                    case 3:
                        _b.sent();
                        _b.label = 4;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    SingleNode.prototype.resetUpdateData = function (attrs) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var attrsReset, _a, _b, _i, attr, rel;
            return tslib_1.__generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        attrsReset = attrs || Object.keys(this.updateData);
                        _a = [];
                        for (_b in this.children)
                            _a.push(_b);
                        _i = 0;
                        _c.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 11];
                        attr = _a[_i];
                        rel = this.judgeRelation(attr);
                        if (!(rel === 2)) return [3 /*break*/, 4];
                        if (!attrsReset.includes('entityId')) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.children[attr].setValue(this.value && this.value[attr])];
                    case 2:
                        _c.sent();
                        _c.label = 3;
                    case 3: return [3 /*break*/, 8];
                    case 4:
                        if (!(typeof rel === 'string')) return [3 /*break*/, 7];
                        if (!attrsReset.includes("".concat(attr, "Id"))) return [3 /*break*/, 6];
                        return [4 /*yield*/, this.children[attr].setValue(this.value && this.value[attr])];
                    case 5:
                        _c.sent();
                        _c.label = 6;
                    case 6: return [3 /*break*/, 8];
                    case 7:
                        if (typeof rel === 'object') {
                            (0, assert_1.assert)(!attrsReset.includes(attr));
                        }
                        _c.label = 8;
                    case 8: return [4 /*yield*/, this.children[attr].resetUpdateData()];
                    case 9:
                        _c.sent();
                        _c.label = 10;
                    case 10:
                        _i++;
                        return [3 /*break*/, 1];
                    case 11:
                        (0, lodash_1.unset)(this.updateData, attrsReset);
                        // this.action = undefined;
                        if (!attrs) {
                            this.dirty = undefined;
                            this.action = undefined;
                        }
                        this.refreshValue();
                        return [2 /*return*/];
                }
            });
        });
    };
    SingleNode.prototype.setForeignKey = function (attr, entity, id) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var proj, _a, subProj, newId, value;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!this.children[attr]) return [3 /*break*/, 9];
                        if (!(typeof this.projection === 'function')) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.projection()];
                    case 1:
                        _a = _b.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        _a = this.projection;
                        _b.label = 3;
                    case 3:
                        proj = _a;
                        subProj = proj[attr];
                        newId = id /*  || this.value?.id */;
                        value = void 0;
                        if (!!newId) return [3 /*break*/, 4];
                        value = undefined;
                        return [3 /*break*/, 7];
                    case 4: return [4 /*yield*/, this.cache.get(entity, {
                            data: subProj,
                            filter: {
                                id: newId,
                            },
                        })];
                    case 5:
                        value = (_b.sent())[0];
                        if (!!value) return [3 /*break*/, 7];
                        return [4 /*yield*/, this.cache.refresh(entity, {
                                data: subProj,
                                filter: {
                                    id: newId,
                                },
                            })];
                    case 6:
                        // 说明cache中没取到，去refresh数据（当页面带有parentId之类的外键参数进行upsert时会有这种情况）
                        value = (_b.sent()).data[0];
                        _b.label = 7;
                    case 7: return [4 /*yield*/, this.children[attr].setValue(value)];
                    case 8:
                        _b.sent();
                        _b.label = 9;
                    case 9: return [2 /*return*/];
                }
            });
        });
    };
    return SingleNode;
}(Node));
var RunningTree = /** @class */ (function (_super) {
    tslib_1.__extends(RunningTree, _super);
    function RunningTree(aspectWrapper, cache, schema) {
        var _this = _super.call(this, aspectWrapper) || this;
        _this.cache = cache;
        _this.schema = schema;
        _this.root = {};
        return _this;
    }
    RunningTree.prototype.createNode = function (options) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var entity, parent, pagination, path, filters, sorters, id, ids, action, updateData, projection, isList, isPicker, beforeExecute, afterExecute, node, parentNode, projectionShape, _a;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        entity = options.entity, parent = options.parent, pagination = options.pagination, path = options.path, filters = options.filters, sorters = options.sorters, id = options.id, ids = options.ids, action = options.action, updateData = options.updateData, projection = options.projection, isList = options.isList, isPicker = options.isPicker, beforeExecute = options.beforeExecute, afterExecute = options.afterExecute;
                        parentNode = parent ? this.findNode(parent) : undefined;
                        if (!(typeof projection === 'function')) return [3 /*break*/, 2];
                        return [4 /*yield*/, projection()];
                    case 1:
                        _a = _b.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        _a = projection;
                        _b.label = 3;
                    case 3:
                        projectionShape = _a;
                        if (!isList) return [3 /*break*/, 4];
                        node = new ListNode(entity, this.schema, this.cache, projection, projectionShape, parentNode, action, updateData, filters, sorters, pagination);
                        return [3 /*break*/, 6];
                    case 4:
                        node = new SingleNode(entity, this.schema, this.cache, projection, projectionShape, parentNode, action, updateData);
                        if (!id) return [3 /*break*/, 6];
                        return [4 /*yield*/, node.setValue({ id: id })];
                    case 5:
                        _b.sent();
                        _b.label = 6;
                    case 6:
                        if (parentNode) {
                            // todo，这里有几种情况，待处理
                        }
                        else {
                            (0, assert_1.assert)(!this.root[path]);
                            this.root[path] = node;
                        }
                        if (!action) return [3 /*break*/, 8];
                        return [4 /*yield*/, node.setAction(action)];
                    case 7:
                        _b.sent();
                        _b.label = 8;
                    case 8:
                        if (updateData) {
                            node.setMultiUpdateData(updateData);
                        }
                        if (beforeExecute) {
                            node.setBeforeExecute(beforeExecute);
                        }
                        if (afterExecute) {
                            node.setAfterExecute(afterExecute);
                        }
                        return [2 /*return*/, node];
                }
            });
        });
    };
    RunningTree.prototype.findNode = function (path) {
        if (this.root[path]) {
            return this.root[path];
        }
        var paths = path.split('.');
        var node = this.root[paths[0]];
        var iter = 1;
        while (iter < paths.length && node) {
            var childPath = paths[iter];
            iter++;
            node = node.getChild(childPath);
        }
        return node;
    };
    RunningTree.prototype.destroyNode = function (path) {
        var node = this.findNode(path);
        if (node) {
            var childPath = path.slice(path.lastIndexOf('.') + 1);
            var parent_1 = node.getParent();
            if (parent_1 instanceof SingleNode) {
                parent_1.removeChild(childPath);
            }
            else if (parent_1 instanceof ListNode) {
                parent_1.removeChild(childPath);
            }
            else if (!parent_1) {
                (0, assert_1.assert)(this.root.hasOwnProperty(path));
                (0, lodash_1.unset)(this.root, path);
            }
            node.destroy();
        }
    };
    RunningTree.prototype.applyOperation = function (entity, value, operation, projection, scene) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var _loop_1, this_1, operation_1, operation_1_1, action, e_18_1, action, data, applyUpsert, _a;
            var e_18, _b;
            var _this = this;
            return tslib_1.__generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (!(operation instanceof Array)) return [3 /*break*/, 9];
                        (0, assert_1.assert)(value instanceof Array);
                        _loop_1 = function (action) {
                            var _d, _e, _f, filter_2, row, filter_3, row;
                            return tslib_1.__generator(this, function (_g) {
                                switch (_g.label) {
                                    case 0:
                                        _d = action.action;
                                        switch (_d) {
                                            case 'create': return [3 /*break*/, 1];
                                            case 'remove': return [3 /*break*/, 3];
                                        }
                                        return [3 /*break*/, 4];
                                    case 1:
                                        _f = (_e = value).push;
                                        return [4 /*yield*/, this_1.applyOperation(entity, {}, action, projection, scene)];
                                    case 2:
                                        _f.apply(_e, [(_g.sent())]);
                                        return [3 /*break*/, 6];
                                    case 3:
                                        {
                                            filter_2 = action.filter;
                                            (0, assert_1.assert)(filter_2.id);
                                            row = value.find(function (ele) { return ele.id === filter_2.id; });
                                            (0, lodash_1.pull)(value, row);
                                            return [3 /*break*/, 6];
                                        }
                                        _g.label = 4;
                                    case 4:
                                        filter_3 = action.filter;
                                        (0, assert_1.assert)(filter_3.id);
                                        row = value.find(function (ele) { return ele.id === filter_3.id; });
                                        return [4 /*yield*/, this_1.applyOperation(entity, row, action, projection, scene)];
                                    case 5:
                                        _g.sent();
                                        _g.label = 6;
                                    case 6: return [2 /*return*/];
                                }
                            });
                        };
                        this_1 = this;
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 6, 7, 8]);
                        operation_1 = tslib_1.__values(operation), operation_1_1 = operation_1.next();
                        _c.label = 2;
                    case 2:
                        if (!!operation_1_1.done) return [3 /*break*/, 5];
                        action = operation_1_1.value;
                        return [5 /*yield**/, _loop_1(action)];
                    case 3:
                        _c.sent();
                        _c.label = 4;
                    case 4:
                        operation_1_1 = operation_1.next();
                        return [3 /*break*/, 2];
                    case 5: return [3 /*break*/, 8];
                    case 6:
                        e_18_1 = _c.sent();
                        e_18 = { error: e_18_1 };
                        return [3 /*break*/, 8];
                    case 7:
                        try {
                            if (operation_1_1 && !operation_1_1.done && (_b = operation_1.return)) _b.call(operation_1);
                        }
                        finally { if (e_18) throw e_18.error; }
                        return [7 /*endfinally*/];
                    case 8: return [2 /*return*/, value];
                    case 9:
                        if (!(value instanceof Array)) return [3 /*break*/, 11];
                        return [4 /*yield*/, Promise.all(value.map(function (row) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                                return tslib_1.__generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, this.applyOperation(entity, row, operation, projection, scene)];
                                        case 1: return [2 /*return*/, _a.sent()];
                                    }
                                });
                            }); }))];
                    case 10: 
                    // todo 这里还有种可能不是对所有的行，只对指定id的行操作
                    return [2 /*return*/, (_c.sent()).filter(function (ele) { return !!ele; })];
                    case 11:
                        action = operation.action, data = operation.data;
                        applyUpsert = function (row, actionData) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                            var _loop_2, this_2, _a, _b, _i, attr, _c, _d, _e, attr, relation, entity_1, entityId, _f, entityRow, _g, entityRow;
                            return tslib_1.__generator(this, function (_h) {
                                switch (_h.label) {
                                    case 0:
                                        _loop_2 = function (attr) {
                                            var relation, _j, _k, _l, _m, _o, _p;
                                            var _q, _r;
                                            return tslib_1.__generator(this, function (_s) {
                                                switch (_s.label) {
                                                    case 0:
                                                        relation = (0, relation_1.judgeRelation)(this_2.schema, entity, attr);
                                                        if (!(relation === 1)) return [3 /*break*/, 1];
                                                        (0, lodash_1.set)(row, attr, actionData[attr]);
                                                        return [3 /*break*/, 9];
                                                    case 1:
                                                        if (!(relation === 2)) return [3 /*break*/, 4];
                                                        if (!projection[attr]) return [3 /*break*/, 3];
                                                        _j = lodash_1.set;
                                                        _k = [row,
                                                            attr];
                                                        return [4 /*yield*/, this_2.applyOperation(attr, row[attr], actionData[attr], projection[attr], scene)];
                                                    case 2:
                                                        _j.apply(void 0, _k.concat([_s.sent()]));
                                                        if (row[attr]) {
                                                            Object.assign(row, {
                                                                entity: attr,
                                                                entityId: row[attr]['id'],
                                                            });
                                                        }
                                                        else {
                                                            Object.assign(row, {
                                                                entity: undefined,
                                                                entityId: undefined,
                                                            });
                                                        }
                                                        _s.label = 3;
                                                    case 3: return [3 /*break*/, 9];
                                                    case 4:
                                                        if (!(typeof relation === 'string')) return [3 /*break*/, 7];
                                                        if (!projection[attr]) return [3 /*break*/, 6];
                                                        _l = lodash_1.set;
                                                        _m = [row,
                                                            attr];
                                                        return [4 /*yield*/, this_2.applyOperation(relation, row[attr], actionData[attr], projection[attr], scene)];
                                                    case 5:
                                                        _l.apply(void 0, _m.concat([_s.sent()]));
                                                        if (row[attr]) {
                                                            Object.assign(row, (_q = {},
                                                                _q["".concat(attr, "Id")] = row[attr]['id'],
                                                                _q));
                                                        }
                                                        else {
                                                            Object.assign(row, (_r = {},
                                                                _r["".concat(attr, "Id")] = undefined,
                                                                _r));
                                                        }
                                                        _s.label = 6;
                                                    case 6: return [3 /*break*/, 9];
                                                    case 7:
                                                        (0, assert_1.assert)(relation instanceof Array);
                                                        if (!projection[attr]) return [3 /*break*/, 9];
                                                        _o = lodash_1.set;
                                                        _p = [row,
                                                            attr];
                                                        return [4 /*yield*/, this_2.applyOperation(relation[0], row[attr], actionData[attr], projection[attr]['data'], scene)];
                                                    case 8:
                                                        _o.apply(void 0, _p.concat([_s.sent()]));
                                                        row[attr].forEach(function (ele) {
                                                            var _a;
                                                            if (relation[1]) {
                                                                Object.assign(ele, (_a = {},
                                                                    _a[relation[1]] = row.id,
                                                                    _a));
                                                            }
                                                            else {
                                                                Object.assign(ele, {
                                                                    entity: entity,
                                                                    entityId: row.id,
                                                                });
                                                            }
                                                        });
                                                        _s.label = 9;
                                                    case 9: return [2 /*return*/];
                                                }
                                            });
                                        };
                                        this_2 = this;
                                        _a = [];
                                        for (_b in actionData)
                                            _a.push(_b);
                                        _i = 0;
                                        _h.label = 1;
                                    case 1:
                                        if (!(_i < _a.length)) return [3 /*break*/, 4];
                                        attr = _a[_i];
                                        return [5 /*yield**/, _loop_2(attr)];
                                    case 2:
                                        _h.sent();
                                        _h.label = 3;
                                    case 3:
                                        _i++;
                                        return [3 /*break*/, 1];
                                    case 4:
                                        _c = [];
                                        for (_d in projection)
                                            _c.push(_d);
                                        _e = 0;
                                        _h.label = 5;
                                    case 5:
                                        if (!(_e < _c.length)) return [3 /*break*/, 10];
                                        attr = _c[_e];
                                        if (!!actionData.hasOwnProperty(attr)) return [3 /*break*/, 9];
                                        relation = (0, relation_1.judgeRelation)(this.schema, entity, attr);
                                        if (!(relation === 2 &&
                                            (actionData.hasOwnProperty('entity') ||
                                                actionData.hasOwnProperty('entityId')))) return [3 /*break*/, 7];
                                        entity_1 = actionData.entity || row.entity;
                                        entityId = actionData.entityId || row.entityId;
                                        return [4 /*yield*/, this.cache.get(entity_1, {
                                                data: projection[attr],
                                                filter: {
                                                    id: entityId,
                                                },
                                            })];
                                    case 6:
                                        _f = tslib_1.__read.apply(void 0, [_h.sent(), 1]), entityRow = _f[0];
                                        (0, lodash_1.set)(row, attr, entityRow);
                                        return [3 /*break*/, 9];
                                    case 7:
                                        if (!(typeof relation === 'string' &&
                                            actionData.hasOwnProperty("".concat(attr, "Id")))) return [3 /*break*/, 9];
                                        return [4 /*yield*/, this.cache.get(relation, {
                                                data: projection[attr],
                                                filter: {
                                                    id: actionData["".concat(attr, "Id")],
                                                },
                                            })];
                                    case 8:
                                        _g = tslib_1.__read.apply(void 0, [_h.sent(), 1]), entityRow = _g[0];
                                        (0, lodash_1.set)(row, attr, entityRow);
                                        _h.label = 9;
                                    case 9:
                                        _e++;
                                        return [3 /*break*/, 5];
                                    case 10: return [2 /*return*/];
                                }
                            });
                        }); };
                        _a = action;
                        switch (_a) {
                            case 'create': return [3 /*break*/, 12];
                            case 'remove': return [3 /*break*/, 14];
                        }
                        return [3 /*break*/, 15];
                    case 12: return [4 /*yield*/, applyUpsert(value, data)];
                    case 13:
                        _c.sent();
                        return [2 /*return*/, value];
                    case 14:
                        {
                            return [2 /*return*/, undefined];
                        }
                        _c.label = 15;
                    case 15: return [4 /*yield*/, applyUpsert(value, data)];
                    case 16:
                        _c.sent();
                        return [2 /*return*/, value];
                }
            });
        });
    };
    RunningTree.prototype.getFreshValue = function (path) {
        var node = this.findNode(path);
        var value = node && node.getFreshValue();
        return value;
    };
    RunningTree.prototype.isDirty = function (path) {
        var node = this.findNode(path);
        return node ? node.isDirty() : false;
    };
    RunningTree.prototype.setUpdateDataInner = function (path, attr, value) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var node, attrSplit, idx, attrSplit_1, attrSplit_1_1, split, idx2, entity, relation, attrName, e_19_1;
            var e_19, _a;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        node = this.findNode(path);
                        attrSplit = attr.split('.');
                        idx = 0;
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 8, 9, 10]);
                        attrSplit_1 = tslib_1.__values(attrSplit), attrSplit_1_1 = attrSplit_1.next();
                        _b.label = 2;
                    case 2:
                        if (!!attrSplit_1_1.done) return [3 /*break*/, 7];
                        split = attrSplit_1_1.value;
                        if (!(node instanceof ListNode)) return [3 /*break*/, 3];
                        idx2 = parseInt(split);
                        (0, assert_1.assert)(typeof idx2 === 'number');
                        node = node.getChild(split, true);
                        idx++;
                        return [3 /*break*/, 6];
                    case 3:
                        entity = node.getEntity();
                        relation = (0, relation_1.judgeRelation)(this.schema, entity, split);
                        if (!(relation === 1)) return [3 /*break*/, 5];
                        attrName = attrSplit.slice(idx).join('.');
                        return [4 /*yield*/, node.setUpdateData(attrName, value)];
                    case 4:
                        _b.sent();
                        return [2 /*return*/];
                    case 5:
                        // node.setDirty();
                        node = node.getChild(split);
                        idx++;
                        _b.label = 6;
                    case 6:
                        attrSplit_1_1 = attrSplit_1.next();
                        return [3 /*break*/, 2];
                    case 7: return [3 /*break*/, 10];
                    case 8:
                        e_19_1 = _b.sent();
                        e_19 = { error: e_19_1 };
                        return [3 /*break*/, 10];
                    case 9:
                        try {
                            if (attrSplit_1_1 && !attrSplit_1_1.done && (_a = attrSplit_1.return)) _a.call(attrSplit_1);
                        }
                        finally { if (e_19) throw e_19.error; }
                        return [7 /*endfinally*/];
                    case 10: return [2 /*return*/];
                }
            });
        });
    };
    RunningTree.prototype.setUpdateData = function (path, attr, value) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.setUpdateDataInner(path, attr, value)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    RunningTree.prototype.setAction = function (path, action) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var node;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        node = this.findNode(path);
                        return [4 /*yield*/, node.setAction(action)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    RunningTree.prototype.setForeignKey = function (parent, attr, id) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var parentNode;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        parentNode = this.findNode(parent);
                        (0, assert_1.assert)(parentNode instanceof SingleNode);
                        return [4 /*yield*/, parentNode.setUpdateData(attr, id)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    RunningTree.prototype.addForeignKeys = function (parent, attr, ids) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var parentNode, ids_1, ids_1_1, id, node, e_20_1;
            var e_20, _a;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        parentNode = this.findNode(parent);
                        (0, assert_1.assert)(parentNode instanceof ListNode);
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 7, 8, 9]);
                        ids_1 = tslib_1.__values(ids), ids_1_1 = ids_1.next();
                        _b.label = 2;
                    case 2:
                        if (!!ids_1_1.done) return [3 /*break*/, 6];
                        id = ids_1_1.value;
                        return [4 /*yield*/, parentNode.pushNewBorn({})];
                    case 3:
                        node = _b.sent();
                        return [4 /*yield*/, node.setUpdateData(attr, id)];
                    case 4:
                        _b.sent();
                        _b.label = 5;
                    case 5:
                        ids_1_1 = ids_1.next();
                        return [3 /*break*/, 2];
                    case 6: return [3 /*break*/, 9];
                    case 7:
                        e_20_1 = _b.sent();
                        e_20 = { error: e_20_1 };
                        return [3 /*break*/, 9];
                    case 8:
                        try {
                            if (ids_1_1 && !ids_1_1.done && (_a = ids_1.return)) _a.call(ids_1);
                        }
                        finally { if (e_20) throw e_20.error; }
                        return [7 /*endfinally*/];
                    case 9: return [2 /*return*/];
                }
            });
        });
    };
    RunningTree.prototype.setUniqueForeignKeys = function (parent, attr, ids) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var parentNode;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        parentNode = this.findNode(parent);
                        (0, assert_1.assert)(parentNode instanceof ListNode);
                        return [4 /*yield*/, parentNode.setUniqueChildren(ids.map(function (id) {
                                var _a;
                                return ({
                                    updateData: (_a = {},
                                        _a[attr] = id,
                                        _a),
                                });
                            }))];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    RunningTree.prototype.refresh = function (path) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var node;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        node = this.findNode(path);
                        return [4 /*yield*/, node.refresh(path)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    RunningTree.prototype.loadMore = function (path) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var node;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        node = this.findNode(path);
                        (0, assert_1.assert)(node instanceof ListNode);
                        return [4 /*yield*/, node.loadMore()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    RunningTree.prototype.getPagination = function (path) {
        var node = this.findNode(path);
        (0, assert_1.assert)(node instanceof ListNode);
        return node.getPagination();
    };
    RunningTree.prototype.setPageSize = function (path, pageSize) {
        var node = this.findNode(path);
        (0, assert_1.assert)(node instanceof ListNode);
        // 切换分页pageSize就重新设置
        node.setPagination({
            pageSize: pageSize,
            currentPage: 1,
            more: true,
        });
    };
    RunningTree.prototype.setCurrentPage = function (path, currentPage) {
        var node = this.findNode(path);
        (0, assert_1.assert)(node instanceof ListNode);
        return node.setCurrentPage(currentPage);
    };
    RunningTree.prototype.getNamedFilters = function (path) {
        var node = this.findNode(path);
        (0, assert_1.assert)(node instanceof ListNode);
        return node.getNamedFilters();
    };
    RunningTree.prototype.getNamedFilterByName = function (path, name) {
        var node = this.findNode(path);
        (0, assert_1.assert)(node instanceof ListNode);
        return node.getNamedFilterByName(name);
    };
    RunningTree.prototype.setNamedFilters = function (path, filters, refresh) {
        if (refresh === void 0) { refresh = true; }
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var node;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        node = this.findNode(path);
                        (0, assert_1.assert)(node instanceof ListNode);
                        node.setNamedFilters(filters);
                        if (!refresh) return [3 /*break*/, 2];
                        return [4 /*yield*/, node.refresh()];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        });
    };
    RunningTree.prototype.addNamedFilter = function (path, filter, refresh) {
        if (refresh === void 0) { refresh = false; }
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var node;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        node = this.findNode(path);
                        (0, assert_1.assert)(node instanceof ListNode);
                        node.addNamedFilter(filter);
                        if (!refresh) return [3 /*break*/, 2];
                        return [4 /*yield*/, node.refresh()];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        });
    };
    RunningTree.prototype.removeNamedFilter = function (path, filter, refresh) {
        if (refresh === void 0) { refresh = false; }
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var node;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        node = this.findNode(path);
                        (0, assert_1.assert)(node instanceof ListNode);
                        node.removeNamedFilter(filter);
                        if (!refresh) return [3 /*break*/, 2];
                        return [4 /*yield*/, node.refresh()];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        });
    };
    RunningTree.prototype.removeNamedFilterByName = function (path, name, refresh) {
        if (refresh === void 0) { refresh = false; }
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var node;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        node = this.findNode(path);
                        (0, assert_1.assert)(node instanceof ListNode);
                        node.removeNamedFilterByName(name);
                        if (!refresh) return [3 /*break*/, 2];
                        return [4 /*yield*/, node.refresh()];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        });
    };
    RunningTree.prototype.getNamedSorters = function (path) {
        var node = this.findNode(path);
        (0, assert_1.assert)(node instanceof ListNode);
        return node.getNamedSorters();
    };
    RunningTree.prototype.getNamedSorterByName = function (path, name) {
        var node = this.findNode(path);
        (0, assert_1.assert)(node instanceof ListNode);
        return node.getNamedSorterByName(name);
    };
    RunningTree.prototype.setNamedSorters = function (path, sorters, refresh) {
        if (refresh === void 0) { refresh = true; }
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var node;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        node = this.findNode(path);
                        (0, assert_1.assert)(node instanceof ListNode);
                        node.setNamedSorters(sorters);
                        if (!refresh) return [3 /*break*/, 2];
                        return [4 /*yield*/, node.refresh()];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        });
    };
    RunningTree.prototype.addNamedSorter = function (path, sorter, refresh) {
        if (refresh === void 0) { refresh = false; }
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var node;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        node = this.findNode(path);
                        (0, assert_1.assert)(node instanceof ListNode);
                        node.addNamedSorter(sorter);
                        if (!refresh) return [3 /*break*/, 2];
                        return [4 /*yield*/, node.refresh()];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        });
    };
    RunningTree.prototype.removeNamedSorter = function (path, sorter, refresh) {
        if (refresh === void 0) { refresh = false; }
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var node;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        node = this.findNode(path);
                        (0, assert_1.assert)(node instanceof ListNode);
                        node.removeNamedSorter(sorter);
                        if (!refresh) return [3 /*break*/, 2];
                        return [4 /*yield*/, node.refresh()];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        });
    };
    RunningTree.prototype.removeNamedSorterByName = function (path, name, refresh) {
        if (refresh === void 0) { refresh = false; }
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var node;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        node = this.findNode(path);
                        (0, assert_1.assert)(node instanceof ListNode);
                        node.removeNamedSorterByName(name);
                        if (!refresh) return [3 /*break*/, 2];
                        return [4 /*yield*/, node.refresh()];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        });
    };
    RunningTree.prototype.testAction = function (path, action, execute) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var node, operation, operation_2, operation_2_1, oper, e_21_1;
            var e_21, _a;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        node = this.findNode(path);
                        if (!execute) return [3 /*break*/, 4];
                        if (!!node.isDirty()) return [3 /*break*/, 2];
                        // remove会出现这样的情况，create和update似乎也不是完全没有可能
                        return [4 /*yield*/, node.setDirty()];
                    case 1:
                        // remove会出现这样的情况，create和update似乎也不是完全没有可能
                        _b.sent();
                        _b.label = 2;
                    case 2: return [4 /*yield*/, this.beforeExecute(node, action)];
                    case 3:
                        _b.sent();
                        _b.label = 4;
                    case 4: return [4 /*yield*/, node.composeOperation(action, execute)];
                    case 5:
                        operation = _b.sent();
                        if (!(operation instanceof Array)) return [3 /*break*/, 14];
                        _b.label = 6;
                    case 6:
                        _b.trys.push([6, 11, 12, 13]);
                        operation_2 = tslib_1.__values(operation), operation_2_1 = operation_2.next();
                        _b.label = 7;
                    case 7:
                        if (!!operation_2_1.done) return [3 /*break*/, 10];
                        oper = operation_2_1.value;
                        return [4 /*yield*/, this.cache.testOperation(node.getEntity(), oper)];
                    case 8:
                        _b.sent();
                        _b.label = 9;
                    case 9:
                        operation_2_1 = operation_2.next();
                        return [3 /*break*/, 7];
                    case 10: return [3 /*break*/, 13];
                    case 11:
                        e_21_1 = _b.sent();
                        e_21 = { error: e_21_1 };
                        return [3 /*break*/, 13];
                    case 12:
                        try {
                            if (operation_2_1 && !operation_2_1.done && (_a = operation_2.return)) _a.call(operation_2);
                        }
                        finally { if (e_21) throw e_21.error; }
                        return [7 /*endfinally*/];
                    case 13: return [3 /*break*/, 17];
                    case 14:
                        if (!operation) return [3 /*break*/, 16];
                        return [4 /*yield*/, this.cache.testOperation(node.getEntity(), operation)];
                    case 15:
                        _b.sent();
                        return [3 /*break*/, 17];
                    case 16:
                        (0, assert_1.assert)(false);
                        _b.label = 17;
                    case 17: return [2 /*return*/, {
                            node: node,
                            operation: operation,
                        }];
                }
            });
        });
    };
    RunningTree.prototype.beforeExecute = function (node2, action) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            function beNode(node, action2) {
                return tslib_1.__awaiter(this, void 0, void 0, function () {
                    var beforeExecuteFn, _a, _b, child, e_22_1, _c, _d, child, e_23_1, _e, _f, _i, k;
                    var e_22, _g, e_23, _h;
                    return tslib_1.__generator(this, function (_j) {
                        switch (_j.label) {
                            case 0:
                                if (!node.isDirty()) return [3 /*break*/, 22];
                                beforeExecuteFn = node.getBeforeExecute();
                                if (!beforeExecuteFn) return [3 /*break*/, 2];
                                return [4 /*yield*/, beforeExecuteFn(node.getUpdateData(), action2 || node.getAction())];
                            case 1:
                                _j.sent();
                                _j.label = 2;
                            case 2:
                                if (!(node instanceof ListNode)) return [3 /*break*/, 18];
                                _j.label = 3;
                            case 3:
                                _j.trys.push([3, 8, 9, 10]);
                                _a = tslib_1.__values(node.getChildren()), _b = _a.next();
                                _j.label = 4;
                            case 4:
                                if (!!_b.done) return [3 /*break*/, 7];
                                child = _b.value;
                                return [4 /*yield*/, beNode(child)];
                            case 5:
                                _j.sent();
                                _j.label = 6;
                            case 6:
                                _b = _a.next();
                                return [3 /*break*/, 4];
                            case 7: return [3 /*break*/, 10];
                            case 8:
                                e_22_1 = _j.sent();
                                e_22 = { error: e_22_1 };
                                return [3 /*break*/, 10];
                            case 9:
                                try {
                                    if (_b && !_b.done && (_g = _a.return)) _g.call(_a);
                                }
                                finally { if (e_22) throw e_22.error; }
                                return [7 /*endfinally*/];
                            case 10:
                                _j.trys.push([10, 15, 16, 17]);
                                _c = tslib_1.__values(node.getNewBorn()), _d = _c.next();
                                _j.label = 11;
                            case 11:
                                if (!!_d.done) return [3 /*break*/, 14];
                                child = _d.value;
                                return [4 /*yield*/, beNode(child)];
                            case 12:
                                _j.sent();
                                _j.label = 13;
                            case 13:
                                _d = _c.next();
                                return [3 /*break*/, 11];
                            case 14: return [3 /*break*/, 17];
                            case 15:
                                e_23_1 = _j.sent();
                                e_23 = { error: e_23_1 };
                                return [3 /*break*/, 17];
                            case 16:
                                try {
                                    if (_d && !_d.done && (_h = _c.return)) _h.call(_c);
                                }
                                finally { if (e_23) throw e_23.error; }
                                return [7 /*endfinally*/];
                            case 17: return [3 /*break*/, 22];
                            case 18:
                                _e = [];
                                for (_f in node.getChildren())
                                    _e.push(_f);
                                _i = 0;
                                _j.label = 19;
                            case 19:
                                if (!(_i < _e.length)) return [3 /*break*/, 22];
                                k = _e[_i];
                                return [4 /*yield*/, beNode(node.getChildren()[k])];
                            case 20:
                                _j.sent();
                                _j.label = 21;
                            case 21:
                                _i++;
                                return [3 /*break*/, 19];
                            case 22: return [2 /*return*/];
                        }
                    });
                });
            }
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, beNode(node2, action)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    RunningTree.prototype.execute = function (path, action) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var _a, node, operation;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.testAction(path, action, true)];
                    case 1:
                        _a = _b.sent(), node = _a.node, operation = _a.operation;
                        return [4 /*yield*/, this.getAspectWrapper().exec('operate', {
                                entity: node.getEntity(),
                                operation: operation,
                            })];
                    case 2:
                        _b.sent();
                        // 清空缓存
                        return [4 /*yield*/, node.resetUpdateData()];
                    case 3:
                        // 清空缓存
                        _b.sent();
                        return [2 /*return*/, operation];
                }
            });
        });
    };
    RunningTree.prototype.pushNode = function (path, options) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var parent;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        parent = this.findNode(path);
                        (0, assert_1.assert)(parent instanceof ListNode);
                        return [4 /*yield*/, parent.pushNewBorn(options)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    RunningTree.prototype.removeNode = function (parent, path) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var parentNode, node, _a, _b, _c;
            var _d, _e;
            return tslib_1.__generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        parentNode = this.findNode(parent);
                        node = parentNode.getChild(path);
                        (0, assert_1.assert)(parentNode instanceof ListNode && node instanceof SingleNode); // 现在应该不可能remove一个list吧，未来对list的处理还要细化
                        if (!(node.getAction() !== 'create')) return [3 /*break*/, 3];
                        _b = (_a = this.getAspectWrapper()).exec;
                        _c = ['operate'];
                        _d = {
                            entity: node.getEntity()
                        };
                        _e = {};
                        return [4 /*yield*/, generateNewId()];
                    case 1: 
                    // 不是增加，说明是删除数据
                    return [4 /*yield*/, _b.apply(_a, _c.concat([(_d.operation = (_e.id = _f.sent(),
                                _e.action = 'remove',
                                _e.data = {},
                                _e.filter = {
                                    id: node.getFreshValue().id,
                                },
                                _e),
                                _d)]))];
                    case 2:
                        // 不是增加，说明是删除数据
                        _f.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        // 删除子结点
                        parentNode.popNewBorn(path);
                        _f.label = 4;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    RunningTree.prototype.resetUpdateData = function (path) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var node;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        node = this.findNode(path);
                        return [4 /*yield*/, node.resetUpdateData()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    RunningTree.prototype.toggleNode = function (path, nodeData, checked) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var node;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        node = this.findNode(path);
                        (0, assert_1.assert)(node instanceof ListNode);
                        return [4 /*yield*/, node.toggleChild({
                                updateData: nodeData,
                            }, checked)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    RunningTree.prototype.getRoot = function () {
        return this.root;
    };
    tslib_1.__decorate([
        Feature_1.Action
    ], RunningTree.prototype, "setUpdateData", null);
    tslib_1.__decorate([
        Feature_1.Action
    ], RunningTree.prototype, "setAction", null);
    tslib_1.__decorate([
        Feature_1.Action
    ], RunningTree.prototype, "setForeignKey", null);
    tslib_1.__decorate([
        Feature_1.Action
    ], RunningTree.prototype, "addForeignKeys", null);
    tslib_1.__decorate([
        Feature_1.Action
    ], RunningTree.prototype, "setUniqueForeignKeys", null);
    tslib_1.__decorate([
        Feature_1.Action
    ], RunningTree.prototype, "refresh", null);
    tslib_1.__decorate([
        Feature_1.Action
    ], RunningTree.prototype, "loadMore", null);
    tslib_1.__decorate([
        Feature_1.Action
    ], RunningTree.prototype, "setPageSize", null);
    tslib_1.__decorate([
        Feature_1.Action
    ], RunningTree.prototype, "setCurrentPage", null);
    tslib_1.__decorate([
        Feature_1.Action
    ], RunningTree.prototype, "setNamedFilters", null);
    tslib_1.__decorate([
        Feature_1.Action
    ], RunningTree.prototype, "addNamedFilter", null);
    tslib_1.__decorate([
        Feature_1.Action
    ], RunningTree.prototype, "removeNamedFilter", null);
    tslib_1.__decorate([
        Feature_1.Action
    ], RunningTree.prototype, "removeNamedFilterByName", null);
    tslib_1.__decorate([
        Feature_1.Action
    ], RunningTree.prototype, "setNamedSorters", null);
    tslib_1.__decorate([
        Feature_1.Action
    ], RunningTree.prototype, "addNamedSorter", null);
    tslib_1.__decorate([
        Feature_1.Action
    ], RunningTree.prototype, "removeNamedSorter", null);
    tslib_1.__decorate([
        Feature_1.Action
    ], RunningTree.prototype, "removeNamedSorterByName", null);
    tslib_1.__decorate([
        Feature_1.Action
    ], RunningTree.prototype, "execute", null);
    tslib_1.__decorate([
        Feature_1.Action
    ], RunningTree.prototype, "pushNode", null);
    tslib_1.__decorate([
        Feature_1.Action
    ], RunningTree.prototype, "removeNode", null);
    tslib_1.__decorate([
        Feature_1.Action
    ], RunningTree.prototype, "resetUpdateData", null);
    tslib_1.__decorate([
        Feature_1.Action
    ], RunningTree.prototype, "toggleNode", null);
    return RunningTree;
}(Feature_1.Feature));
exports.RunningTree = RunningTree;
