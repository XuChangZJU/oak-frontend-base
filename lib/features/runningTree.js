"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RunningTree = void 0;
var assert_1 = require("oak-domain/lib/utils/assert");
var lodash_1 = require("oak-domain/lib/utils/lodash");
var filter_1 = require("oak-domain/lib/store/filter");
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
        this.dirty = false;
        this.refreshing = false;
        this.updateData = updateData || {};
        this.cache.bindOnSync(function (records) { return _this.onCacheSync(records); });
    }
    Node.prototype.getEntity = function () {
        return this.entity;
    };
    Node.prototype.setLocalUpdateData = function (attr, value) {
        var _a, _b, _c;
        var rel = this.judgeRelation(attr);
        var subEntity = undefined;
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
        }
        else {
            (0, assert_1.assert)(rel === 1);
            Object.assign(this.updateData, (_c = {},
                _c[attr] = value,
                _c));
        }
        if (subEntity) {
            // 说明是更新了外键
            this.setForeignKey(attr, subEntity, value);
        }
    };
    Node.prototype.setUpdateData = function (attr, value) {
        this.setLocalUpdateData(attr, value);
        this.setDirty();
        this.refreshValue();
    };
    Node.prototype.getUpdateData = function () {
        return this.updateData;
    };
    Node.prototype.setMultiUpdateData = function (updateData) {
        for (var k in updateData) {
            this.setLocalUpdateData(k, updateData[k]);
        }
        this.setDirty();
        this.refreshValue();
    };
    Node.prototype.setDirty = function () {
        if (!this.dirty) {
            this.dirty = true;
            if (this.parent) {
                this.parent.setDirty();
            }
        }
    };
    Node.prototype.setAction = function (action) {
        this.action = action;
        this.setDirty();
        this.refreshValue();
    };
    Node.prototype.isDirty = function () {
        return this.dirty;
    };
    Node.prototype.getParent = function () {
        return this.parent;
    };
    Node.prototype.getProjection = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
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
        this.cache.unbindOnSync(this.onCacheSync);
    };
    Node.prototype.judgeRelation = function (attr) {
        return (0, relation_1.judgeRelation)(this.schema, this.entity, attr);
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
    __extends(ListNode, _super);
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
        return __awaiter(this, void 0, void 0, function () {
            var createdIds, removeIds, records_1, records_1_1, record, a, _a, e, d, id, _b, e, f, currentIds, filter, sorterss, projection, _c, value;
            var e_1, _d;
            var _this = this;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        if (this.refreshing) {
                            return [2 /*return*/];
                        }
                        createdIds = [];
                        removeIds = false;
                        try {
                            for (records_1 = __values(records), records_1_1 = records_1.next(); !records_1_1.done; records_1_1 = records_1.next()) {
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
                        if (!(createdIds.length > 0 || removeIds)) return [3 /*break*/, 6];
                        currentIds = this.children
                            .map(function (ele) { var _a; return (_a = ele.getFreshValue()) === null || _a === void 0 ? void 0 : _a.id; })
                            .filter(function (ele) { return !!ele; });
                        filter = (0, filter_1.combineFilters)(__spreadArray([
                            {
                                id: {
                                    $in: currentIds.concat(createdIds),
                                },
                            }
                        ], __read(this.filters.map(function (ele) { return ele.filter; })), false));
                        return [4 /*yield*/, Promise.all(this.sorters.map(function (ele) { return __awaiter(_this, void 0, void 0, function () {
                                var sorter;
                                return __generator(this, function (_a) {
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
                        this.setValue(value);
                        _e.label = 6;
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    ListNode.prototype.setForeignKey = function (attr, entity, id) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
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
        var _this = this;
        this.children = [];
        value &&
            value.forEach(function (ele, idx) {
                var node = new SingleNode(_this.entity, _this.schema, _this.cache, _this.projection, _this.projectionShape, _this);
                _this.children[idx] = node;
                node.setValue(ele);
            });
    };
    ListNode.prototype.appendValue = function (value) {
        var _this = this;
        value &&
            value.forEach(function (ele, idx) {
                var node = new SingleNode(_this.entity, _this.schema, _this.cache, _this.projection, _this.projectionShape, _this);
                _this.children[_this.children.length + idx] = node;
                node.setValue(ele);
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
        (0, assert_1.assert)(this.dirty);
        return this.action || 'update';
    };
    ListNode.prototype.composeOperation = function (action, execute) {
        return __awaiter(this, void 0, void 0, function () {
            var actions, _a, _b, node, subAction, e_2_1, _c, _d, node, subAction, e_3_1;
            var e_2, _e, e_3, _f;
            return __generator(this, function (_g) {
                switch (_g.label) {
                    case 0:
                        if (!this.isDirty()) {
                            if (action) {
                                (0, assert_1.assert)(action === 'create'); // 在list页面测试create是否允许？
                                return [2 /*return*/, {
                                        action: action,
                                        data: {},
                                    }];
                            }
                            return [2 /*return*/];
                        }
                        // todo 这里的逻辑还没有测试过，后面还有ids选择的Case
                        if (this.action) {
                            return [2 /*return*/, {
                                    action: this.getAction(),
                                    data: (0, lodash_1.cloneDeep)(this.updateData),
                                    filter: (0, filter_1.combineFilters)(this.filters.map(function (ele) { return ele.filter; })),
                                }]; // todo 这里以后再增加对选中id的过滤
                        }
                        actions = [];
                        _g.label = 1;
                    case 1:
                        _g.trys.push([1, 6, 7, 8]);
                        _a = __values(this.children), _b = _a.next();
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
                        e_2_1 = _g.sent();
                        e_2 = { error: e_2_1 };
                        return [3 /*break*/, 8];
                    case 7:
                        try {
                            if (_b && !_b.done && (_e = _a.return)) _e.call(_a);
                        }
                        finally { if (e_2) throw e_2.error; }
                        return [7 /*endfinally*/];
                    case 8:
                        _g.trys.push([8, 13, 14, 15]);
                        _c = __values(this.newBorn), _d = _c.next();
                        _g.label = 9;
                    case 9:
                        if (!!_d.done) return [3 /*break*/, 12];
                        node = _d.value;
                        return [4 /*yield*/, node.composeOperation(undefined, execute)];
                    case 10:
                        subAction = _g.sent();
                        if (subAction) {
                            (0, assert_1.assert)(!action || action === 'update'); // 如果还有新建，应该不会有其它类型的action
                            actions.push(subAction);
                        }
                        _g.label = 11;
                    case 11:
                        _d = _c.next();
                        return [3 /*break*/, 9];
                    case 12: return [3 /*break*/, 15];
                    case 13:
                        e_3_1 = _g.sent();
                        e_3 = { error: e_3_1 };
                        return [3 /*break*/, 15];
                    case 14:
                        try {
                            if (_d && !_d.done && (_f = _c.return)) _f.call(_c);
                        }
                        finally { if (e_3) throw e_3.error; }
                        return [7 /*endfinally*/];
                    case 15: return [2 /*return*/, actions];
                }
            });
        });
    };
    ListNode.prototype.refresh = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, filters, sorters, pagination, entity, pageSize, proj, sorterArr, filterArr, currentPage, _b, data, count;
            var _this = this;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _a = this, filters = _a.filters, sorters = _a.sorters, pagination = _a.pagination, entity = _a.entity;
                        pageSize = pagination.pageSize;
                        return [4 /*yield*/, this.getProjection()];
                    case 1:
                        proj = _c.sent();
                        (0, assert_1.assert)(proj);
                        return [4 /*yield*/, Promise.all(sorters.map(function (ele) { return __awaiter(_this, void 0, void 0, function () {
                                var sorter;
                                return __generator(this, function (_a) {
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
                        return [4 /*yield*/, Promise.all(filters.map(function (ele) { return __awaiter(_this, void 0, void 0, function () {
                                var filter;
                                return __generator(this, function (_a) {
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
                        this.setValue(data);
                        return [2 /*return*/];
                }
            });
        });
    };
    ListNode.prototype.loadMore = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, filters, sorters, pagination, entity, pageSize, more, currentPage, proj, sorterArr, filterArr, currentPage2, data;
            var _this = this;
            return __generator(this, function (_b) {
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
                        return [4 /*yield*/, Promise.all(sorters.map(function (ele) { return __awaiter(_this, void 0, void 0, function () {
                                var sorter;
                                return __generator(this, function (_a) {
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
                        return [4 /*yield*/, Promise.all(filters.map(function (ele) { return __awaiter(_this, void 0, void 0, function () {
                                var filter;
                                return __generator(this, function (_a) {
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
        return __awaiter(this, void 0, void 0, function () {
            var _a, filters, sorters, pagination, entity, pageSize, proj, sorterArr, filterArr, data;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = this, filters = _a.filters, sorters = _a.sorters, pagination = _a.pagination, entity = _a.entity;
                        pageSize = pagination.pageSize;
                        return [4 /*yield*/, this.getProjection()];
                    case 1:
                        proj = _b.sent();
                        (0, assert_1.assert)(proj);
                        return [4 /*yield*/, Promise.all(sorters.map(function (ele) { return __awaiter(_this, void 0, void 0, function () {
                                var sorter;
                                return __generator(this, function (_a) {
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
                        return [4 /*yield*/, Promise.all(filters.map(function (ele) { return __awaiter(_this, void 0, void 0, function () {
                                var filter;
                                return __generator(this, function (_a) {
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
                        if (append) {
                            this.appendValue(data);
                        }
                        else {
                            this.setValue(data);
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    ListNode.prototype.resetUpdateData = function () {
        this.updateData = {};
        this.action = undefined;
        this.dirty = false;
        this.children.forEach(function (ele) { return ele.resetUpdateData(); });
        this.newBorn = [];
    };
    ListNode.prototype.pushNewBorn = function (options) {
        var updateData = options.updateData, beforeExecute = options.beforeExecute, afterExecute = options.afterExecute;
        var node = new SingleNode(this.entity, this.schema, this.cache, this.projection, this.projectionShape, this, 'create');
        if (updateData) {
            node.setMultiUpdateData(updateData);
        }
        if (beforeExecute) {
            node.setBeforeExecute(beforeExecute);
        }
        if (afterExecute) {
            node.setAfterExecute(afterExecute);
        }
        this.newBorn.push(node);
        return node;
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
        var e_4, _a, e_5, _b, e_6, _c, e_7, _d, e_8, _e, e_9, _f, e_10, _g;
        var _this = this;
        var convertForeignKey = function (origin) {
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
        var uds = [];
        try {
            for (var data_1 = __values(data), data_1_1 = data_1.next(); !data_1_1.done; data_1_1 = data_1.next()) {
                var dt = data_1_1.value;
                var existed = false;
                var updateData = dt.updateData;
                var ud2 = convertForeignKey(updateData);
                uds.push(ud2);
                try {
                    for (var _h = (e_5 = void 0, __values(this.children)), _j = _h.next(); !_j.done; _j = _h.next()) {
                        var child = _j.value;
                        if (this.judgeTheSame(child.getFreshValue(true), ud2)) {
                            if (child.getAction() === 'remove') {
                                // 这里把updateData全干掉了，如果本身是先update再remove或许会有问题 by Xc
                                child.resetUpdateData();
                            }
                            existed = true;
                            break;
                        }
                    }
                }
                catch (e_5_1) { e_5 = { error: e_5_1 }; }
                finally {
                    try {
                        if (_j && !_j.done && (_b = _h.return)) _b.call(_h);
                    }
                    finally { if (e_5) throw e_5.error; }
                }
                try {
                    for (var _k = (e_6 = void 0, __values(this.newBorn)), _l = _k.next(); !_l.done; _l = _k.next()) {
                        var child = _l.value;
                        if (this.judgeTheSame(child.getFreshValue(true), ud2)) {
                            existed = true;
                            break;
                        }
                    }
                }
                catch (e_6_1) { e_6 = { error: e_6_1 }; }
                finally {
                    try {
                        if (_l && !_l.done && (_c = _k.return)) _c.call(_k);
                    }
                    finally { if (e_6) throw e_6.error; }
                }
                if (!existed) {
                    // 如果不存在，就生成newBorn
                    this.pushNewBorn(dt);
                }
            }
        }
        catch (e_4_1) { e_4 = { error: e_4_1 }; }
        finally {
            try {
                if (data_1_1 && !data_1_1.done && (_a = data_1.return)) _a.call(data_1);
            }
            finally { if (e_4) throw e_4.error; }
        }
        try {
            for (var _m = __values(this.children), _o = _m.next(); !_o.done; _o = _m.next()) {
                var child = _o.value;
                var included = false;
                try {
                    for (var uds_1 = (e_8 = void 0, __values(uds)), uds_1_1 = uds_1.next(); !uds_1_1.done; uds_1_1 = uds_1.next()) {
                        var ud = uds_1_1.value;
                        if (this.judgeTheSame(child.getFreshValue(true), ud)) {
                            included = true;
                            break;
                        }
                    }
                }
                catch (e_8_1) { e_8 = { error: e_8_1 }; }
                finally {
                    try {
                        if (uds_1_1 && !uds_1_1.done && (_e = uds_1.return)) _e.call(uds_1);
                    }
                    finally { if (e_8) throw e_8.error; }
                }
                if (!included) {
                    child.setAction('remove');
                }
            }
        }
        catch (e_7_1) { e_7 = { error: e_7_1 }; }
        finally {
            try {
                if (_o && !_o.done && (_d = _m.return)) _d.call(_m);
            }
            finally { if (e_7) throw e_7.error; }
        }
        var newBorn2 = [];
        try {
            for (var _p = __values(this.newBorn), _q = _p.next(); !_q.done; _q = _p.next()) {
                var child = _q.value;
                try {
                    for (var uds_2 = (e_10 = void 0, __values(uds)), uds_2_1 = uds_2.next(); !uds_2_1.done; uds_2_1 = uds_2.next()) {
                        var ud = uds_2_1.value;
                        if (this.judgeTheSame(child.getFreshValue(true), ud)) {
                            newBorn2.push(child);
                            break;
                        }
                    }
                }
                catch (e_10_1) { e_10 = { error: e_10_1 }; }
                finally {
                    try {
                        if (uds_2_1 && !uds_2_1.done && (_g = uds_2.return)) _g.call(uds_2);
                    }
                    finally { if (e_10) throw e_10.error; }
                }
            }
        }
        catch (e_9_1) { e_9 = { error: e_9_1 }; }
        finally {
            try {
                if (_q && !_q.done && (_f = _p.return)) _f.call(_p);
            }
            finally { if (e_9) throw e_9.error; }
        }
        this.newBorn = newBorn2;
    };
    ListNode.prototype.toggleChild = function (data, checked) {
        var e_11, _a, e_12, _b, e_13, _c;
        var updateData = data.updateData;
        if (checked) {
            try {
                // 如果是选中，这里要处理一种例外就是之前被删除
                for (var _d = __values(this.children), _e = _d.next(); !_e.done; _e = _d.next()) {
                    var child = _e.value;
                    if (this.judgeTheSame(child.getFreshValue(true), updateData)) {
                        (0, assert_1.assert)(child.getAction() === 'remove');
                        // 这里把updateData全干掉了，如果本身是先update再remove或许会有问题 by Xc
                        child.resetUpdateData();
                        return;
                    }
                }
            }
            catch (e_11_1) { e_11 = { error: e_11_1 }; }
            finally {
                try {
                    if (_e && !_e.done && (_a = _d.return)) _a.call(_d);
                }
                finally { if (e_11) throw e_11.error; }
            }
            this.pushNewBorn(data);
        }
        else {
            try {
                for (var _f = __values(this.children), _g = _f.next(); !_g.done; _g = _f.next()) {
                    var child = _g.value;
                    if (this.judgeTheSame(child.getFreshValue(true), updateData)) {
                        (0, assert_1.assert)(child.getAction() !== 'remove');
                        // 这里把updateData全干掉了，如果本身是先update再remove或许会有问题 by Xc
                        child.setAction('remove');
                        return;
                    }
                }
            }
            catch (e_12_1) { e_12 = { error: e_12_1 }; }
            finally {
                try {
                    if (_g && !_g.done && (_b = _f.return)) _b.call(_f);
                }
                finally { if (e_12) throw e_12.error; }
            }
            try {
                for (var _h = __values(this.newBorn), _j = _h.next(); !_j.done; _j = _h.next()) {
                    var child = _j.value;
                    if (this.judgeTheSame(child.getFreshValue(true), updateData)) {
                        (0, lodash_1.pull)(this.newBorn, child);
                        return;
                    }
                }
            }
            catch (e_13_1) { e_13 = { error: e_13_1 }; }
            finally {
                try {
                    if (_j && !_j.done && (_c = _h.return)) _c.call(_h);
                }
                finally { if (e_13) throw e_13.error; }
            }
            (0, assert_1.assert)(false, 'toggle动作的remove对象没有找到对应的子结点');
        }
    };
    return ListNode;
}(Node));
var SingleNode = /** @class */ (function (_super) {
    __extends(SingleNode, _super);
    function SingleNode(entity, schema, cache, projection, projectionShape, parent, action, updateData) {
        var _this = _super.call(this, entity, schema, cache, projection, parent, action, updateData) || this;
        _this.children = {};
        var ownKeys = [];
        Object.keys(projectionShape).forEach(function (attr) {
            var _a, _b, _c;
            var proj = typeof projection === 'function' ? function () { return __awaiter(_this, void 0, void 0, function () {
                var projection2;
                return __generator(this, function (_a) {
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
            }
            else if (typeof rel === 'string') {
                var node = new SingleNode(rel, _this.schema, _this.cache, proj, projectionShape[attr], _this);
                Object.assign(_this.children, (_b = {},
                    _b[attr] = node,
                    _b));
            }
            else if (typeof rel === 'object' && rel instanceof Array) {
                var subProjectionShape = projectionShape[attr].data;
                var proj_1 = typeof projection === 'function' ? function () { return __awaiter(_this, void 0, void 0, function () {
                    var projection2;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, projection()];
                            case 1:
                                projection2 = _a.sent();
                                return [2 /*return*/, projection2[attr].data];
                        }
                    });
                }); } : projection[attr].data;
                var filter = typeof projection === 'function' ? function () { return __awaiter(_this, void 0, void 0, function () {
                    var projection2;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, projection()];
                            case 1:
                                projection2 = _a.sent();
                                return [2 /*return*/, projection2[attr].filter];
                        }
                    });
                }); } : projection[attr].filter;
                var sorters = typeof projection === 'function' ? function () { return __awaiter(_this, void 0, void 0, function () {
                    var projection2;
                    return __generator(this, function (_a) {
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
                Object.assign(_this.children, (_c = {},
                    _c[attr] = node_1,
                    _c));
            }
            else {
                ownKeys.push(attr);
            }
        });
        return _this;
    }
    SingleNode.prototype.onCacheSync = function (records) {
        return __awaiter(this, void 0, void 0, function () {
            var needReGetValue, records_2, records_2_1, record, a, _a, e, d, _b, e, f, d, e, id, projection, _c, _d, value;
            var e_14, _e;
            var _this = this;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        needReGetValue = false;
                        if (this.refreshing || !this.id) {
                            return [2 /*return*/];
                        }
                        try {
                            for (records_2 = __values(records), records_2_1 = records_2.next(); !records_2_1.done; records_2_1 = records_2.next()) {
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
                        catch (e_14_1) { e_14 = { error: e_14_1 }; }
                        finally {
                            try {
                                if (records_2_1 && !records_2_1.done && (_e = records_2.return)) _e.call(records_2);
                            }
                            finally { if (e_14) throw e_14.error; }
                        }
                        if (!needReGetValue) return [3 /*break*/, 5];
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
                        _d = __read.apply(void 0, [_f.sent(), 1]), value = _d[0];
                        this.setValue(value);
                        _f.label = 5;
                    case 5: return [2 /*return*/];
                }
            });
        });
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
        var _a;
        for (var attr in this.children) {
            var node = this.children[attr];
            if (value && value[attr]) {
                node.setValue(value[attr]);
                if (node instanceof ListNode) {
                    var rel = this.judgeRelation(attr);
                    (0, assert_1.assert)(rel instanceof Array);
                    var filter = rel[1] ? (_a = {},
                        _a[rel[1]] = value.id,
                        _a) : {
                        entityId: value.id,
                    };
                    node.removeNamedFilterByName('inherent:parentId');
                    node.addNamedFilter({
                        filter: filter,
                        "#name": 'inherent:parentId',
                    });
                }
            }
            else {
                node.setValue(undefined);
            }
        }
        this.id = value && value.id;
        this.value = value;
        this.refreshValue();
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
        return __awaiter(this, void 0, void 0, function () {
            var action, operation, _a, _b, _c, _d, _e, _f, _g, _i, attr, subAction;
            var _h, _j, _k;
            return __generator(this, function (_l) {
                switch (_l.label) {
                    case 0:
                        if (!action2 && !this.isDirty()) {
                            return [2 /*return*/];
                        }
                        action = action2 || this.getAction();
                        if (!(action === 'create')) return [3 /*break*/, 4];
                        _h = {
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
        return __awaiter(this, void 0, void 0, function () {
            var projection, _a, value;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.getProjection()];
                    case 1:
                        projection = _b.sent();
                        if (!this.id) return [3 /*break*/, 3];
                        this.refreshing = true;
                        return [4 /*yield*/, this.cache.refresh(this.entity, {
                                data: projection,
                                filter: {
                                    id: this.id,
                                },
                            })];
                    case 2:
                        _a = __read.apply(void 0, [(_b.sent()).data, 1]), value = _a[0];
                        this.refreshing = false;
                        this.setValue(value);
                        _b.label = 3;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    SingleNode.prototype.resetUpdateData = function (attrs) {
        var attrsReset = attrs || Object.keys(this.updateData);
        for (var attr in this.children) {
            var rel = this.judgeRelation(attr);
            if (rel === 2) {
                if (attrsReset.includes('entityId')) {
                    this.children[attr].setValue(this.value && this.value[attr]);
                }
            }
            else if (typeof rel === 'string') {
                if (attrsReset.includes("".concat(attr, "Id"))) {
                    this.children[attr].setValue(this.value && this.value[attr]);
                }
            }
            else if (typeof rel === 'object') {
                (0, assert_1.assert)(!attrsReset.includes(attr));
            }
            this.children[attr].resetUpdateData();
        }
        (0, lodash_1.unset)(this.updateData, attrsReset);
        // this.action = undefined;
        if (!attrs) {
            this.dirty = false;
            this.action = undefined;
        }
        this.refreshValue();
    };
    SingleNode.prototype.setForeignKey = function (attr, entity, id) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var proj, _b, subProj, newId, _c, value, _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        if (!this.children[attr]) return [3 /*break*/, 7];
                        if (!(typeof this.projection === 'function')) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.projection()];
                    case 1:
                        _b = _e.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        _b = this.projection;
                        _e.label = 3;
                    case 3:
                        proj = _b;
                        subProj = proj[attr];
                        newId = id || ((_a = this.value) === null || _a === void 0 ? void 0 : _a.id);
                        if (!newId) return [3 /*break*/, 5];
                        return [4 /*yield*/, this.cache.get(entity, {
                                data: subProj,
                                filter: {
                                    id: newId,
                                },
                            })];
                    case 4:
                        _d = _e.sent();
                        return [3 /*break*/, 6];
                    case 5:
                        _d = [undefined];
                        _e.label = 6;
                    case 6:
                        _c = __read.apply(void 0, [_d, 1]), value = _c[0];
                        this.children[attr].setValue(value);
                        _e.label = 7;
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    return SingleNode;
}(Node));
var RunningTree = /** @class */ (function (_super) {
    __extends(RunningTree, _super);
    function RunningTree(aspectWrapper, cache, schema) {
        var _this = _super.call(this, aspectWrapper) || this;
        _this.cache = cache;
        _this.schema = schema;
        _this.root = {};
        return _this;
    }
    RunningTree.prototype.createNode = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            var entity, parent, pagination, path, filters, sorters, id, ids, action, updateData, projection, isList, isPicker, beforeExecute, afterExecute, node, parentNode, projectionShape, _a;
            return __generator(this, function (_b) {
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
                        if (isList) {
                            node = new ListNode(entity, this.schema, this.cache, projection, projectionShape, parentNode, action, updateData, filters, sorters, pagination);
                        }
                        else {
                            node = new SingleNode(entity, this.schema, this.cache, projection, projectionShape, parentNode, action, updateData);
                            if (id) {
                                node.setValue({ id: id });
                            }
                        }
                        if (parentNode) {
                            // todo，这里有几种情况，待处理
                        }
                        else {
                            (0, assert_1.assert)(!this.root[path]);
                            this.root[path] = node;
                        }
                        if (action) {
                            node.setAction(action);
                        }
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
        }
    };
    RunningTree.prototype.applyOperation = function (entity, value, operation, projection, scene) {
        return __awaiter(this, void 0, void 0, function () {
            var _loop_1, this_1, operation_1, operation_1_1, action, e_15_1, action, data, applyUpsert, _a;
            var e_15, _b;
            var _this = this;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (!(operation instanceof Array)) return [3 /*break*/, 9];
                        (0, assert_1.assert)(value instanceof Array);
                        _loop_1 = function (action) {
                            var _d, _e, _f, filter_2, row, filter_3, row;
                            return __generator(this, function (_g) {
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
                        operation_1 = __values(operation), operation_1_1 = operation_1.next();
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
                        e_15_1 = _c.sent();
                        e_15 = { error: e_15_1 };
                        return [3 /*break*/, 8];
                    case 7:
                        try {
                            if (operation_1_1 && !operation_1_1.done && (_b = operation_1.return)) _b.call(operation_1);
                        }
                        finally { if (e_15) throw e_15.error; }
                        return [7 /*endfinally*/];
                    case 8: return [2 /*return*/, value];
                    case 9:
                        if (!(value instanceof Array)) return [3 /*break*/, 11];
                        return [4 /*yield*/, Promise.all(value.map(function (row) { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
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
                        applyUpsert = function (row, actionData) { return __awaiter(_this, void 0, void 0, function () {
                            var _loop_2, this_2, _a, _b, _i, attr, _c, _d, _e, attr, relation, entity_1, entityId, _f, entityRow, _g, entityRow;
                            return __generator(this, function (_h) {
                                switch (_h.label) {
                                    case 0:
                                        _loop_2 = function (attr) {
                                            var relation, _j, _k, _l, _m, _o, _p;
                                            var _q, _r;
                                            return __generator(this, function (_s) {
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
                                        _f = __read.apply(void 0, [_h.sent(), 1]), entityRow = _f[0];
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
                                        _g = __read.apply(void 0, [_h.sent(), 1]), entityRow = _g[0];
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
        return __awaiter(this, void 0, void 0, function () {
            var node, attrSplit, idx, attrSplit_1, attrSplit_1_1, split, idx2, entity, relation, attrName;
            var e_16, _a;
            return __generator(this, function (_b) {
                node = this.findNode(path);
                attrSplit = attr.split('.');
                idx = 0;
                try {
                    for (attrSplit_1 = __values(attrSplit), attrSplit_1_1 = attrSplit_1.next(); !attrSplit_1_1.done; attrSplit_1_1 = attrSplit_1.next()) {
                        split = attrSplit_1_1.value;
                        if (node instanceof ListNode) {
                            idx2 = parseInt(split);
                            (0, assert_1.assert)(typeof idx2 === 'number');
                            node = node.getChild(split, true);
                            idx++;
                        }
                        else {
                            entity = node.getEntity();
                            relation = (0, relation_1.judgeRelation)(this.schema, entity, split);
                            if (relation === 1) {
                                attrName = attrSplit.slice(idx).join('.');
                                node.setUpdateData(attrName, value);
                                return [2 /*return*/];
                            }
                            else {
                                // node.setDirty();
                                node = node.getChild(split);
                                idx++;
                            }
                        }
                    }
                }
                catch (e_16_1) { e_16 = { error: e_16_1 }; }
                finally {
                    try {
                        if (attrSplit_1_1 && !attrSplit_1_1.done && (_a = attrSplit_1.return)) _a.call(attrSplit_1);
                    }
                    finally { if (e_16) throw e_16.error; }
                }
                return [2 /*return*/];
            });
        });
    };
    RunningTree.prototype.setUpdateData = function (path, attr, value) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
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
        return __awaiter(this, void 0, void 0, function () {
            var node;
            return __generator(this, function (_a) {
                node = this.findNode(path);
                node.setAction(action);
                return [2 /*return*/];
            });
        });
    };
    RunningTree.prototype.setForeignKey = function (parent, attr, id) {
        var parentNode = this.findNode(parent);
        (0, assert_1.assert)(parentNode instanceof SingleNode);
        parentNode.setUpdateData(attr, id);
    };
    RunningTree.prototype.addForeignKeys = function (parent, attr, ids) {
        var parentNode = this.findNode(parent);
        (0, assert_1.assert)(parentNode instanceof ListNode);
        ids.forEach(function (id) {
            var node = parentNode.pushNewBorn({});
            node.setUpdateData(attr, id);
        });
    };
    RunningTree.prototype.setUniqueForeignKeys = function (parent, attr, ids) {
        var parentNode = this.findNode(parent);
        (0, assert_1.assert)(parentNode instanceof ListNode);
        parentNode.setUniqueChildren(ids.map(function (id) {
            var _a;
            return ({
                updateData: (_a = {},
                    _a[attr] = id,
                    _a),
            });
        }));
    };
    RunningTree.prototype.refresh = function (path) {
        return __awaiter(this, void 0, void 0, function () {
            var node;
            return __generator(this, function (_a) {
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
        return __awaiter(this, void 0, void 0, function () {
            var node;
            return __generator(this, function (_a) {
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
        return __awaiter(this, void 0, void 0, function () {
            var node;
            return __generator(this, function (_a) {
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
        return __awaiter(this, void 0, void 0, function () {
            var node;
            return __generator(this, function (_a) {
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
        return __awaiter(this, void 0, void 0, function () {
            var node;
            return __generator(this, function (_a) {
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
        return __awaiter(this, void 0, void 0, function () {
            var node;
            return __generator(this, function (_a) {
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
        return __awaiter(this, void 0, void 0, function () {
            var node;
            return __generator(this, function (_a) {
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
        return __awaiter(this, void 0, void 0, function () {
            var node;
            return __generator(this, function (_a) {
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
        return __awaiter(this, void 0, void 0, function () {
            var node;
            return __generator(this, function (_a) {
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
        return __awaiter(this, void 0, void 0, function () {
            var node;
            return __generator(this, function (_a) {
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
        return __awaiter(this, void 0, void 0, function () {
            var node, operation, operation_2, operation_2_1, oper, e_17_1;
            var e_17, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        node = this.findNode(path);
                        if (!execute) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.beforeExecute(node, action)];
                    case 1:
                        _b.sent();
                        _b.label = 2;
                    case 2: return [4 /*yield*/, node.composeOperation(action, execute)];
                    case 3:
                        operation = _b.sent();
                        if (!(operation instanceof Array)) return [3 /*break*/, 12];
                        _b.label = 4;
                    case 4:
                        _b.trys.push([4, 9, 10, 11]);
                        operation_2 = __values(operation), operation_2_1 = operation_2.next();
                        _b.label = 5;
                    case 5:
                        if (!!operation_2_1.done) return [3 /*break*/, 8];
                        oper = operation_2_1.value;
                        return [4 /*yield*/, this.cache.operate(node.getEntity(), oper)];
                    case 6:
                        _b.sent();
                        _b.label = 7;
                    case 7:
                        operation_2_1 = operation_2.next();
                        return [3 /*break*/, 5];
                    case 8: return [3 /*break*/, 11];
                    case 9:
                        e_17_1 = _b.sent();
                        e_17 = { error: e_17_1 };
                        return [3 /*break*/, 11];
                    case 10:
                        try {
                            if (operation_2_1 && !operation_2_1.done && (_a = operation_2.return)) _a.call(operation_2);
                        }
                        finally { if (e_17) throw e_17.error; }
                        return [7 /*endfinally*/];
                    case 11: return [3 /*break*/, 15];
                    case 12:
                        if (!operation) return [3 /*break*/, 14];
                        return [4 /*yield*/, this.cache.operate(node.getEntity(), operation)];
                    case 13:
                        _b.sent();
                        return [3 /*break*/, 15];
                    case 14:
                        (0, assert_1.assert)(false);
                        _b.label = 15;
                    case 15: return [2 /*return*/, {
                            node: node,
                            operation: operation,
                        }];
                }
            });
        });
    };
    RunningTree.prototype.beforeExecute = function (node2, action) {
        return __awaiter(this, void 0, void 0, function () {
            function beNode(node, action2) {
                return __awaiter(this, void 0, void 0, function () {
                    var beforeExecuteFn, _a, _b, child, e_18_1, _c, _d, child, e_19_1, _e, _f, _i, k;
                    var e_18, _g, e_19, _h;
                    return __generator(this, function (_j) {
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
                                _a = __values(node.getChildren()), _b = _a.next();
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
                                e_18_1 = _j.sent();
                                e_18 = { error: e_18_1 };
                                return [3 /*break*/, 10];
                            case 9:
                                try {
                                    if (_b && !_b.done && (_g = _a.return)) _g.call(_a);
                                }
                                finally { if (e_18) throw e_18.error; }
                                return [7 /*endfinally*/];
                            case 10:
                                _j.trys.push([10, 15, 16, 17]);
                                _c = __values(node.getNewBorn()), _d = _c.next();
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
                                e_19_1 = _j.sent();
                                e_19 = { error: e_19_1 };
                                return [3 /*break*/, 17];
                            case 16:
                                try {
                                    if (_d && !_d.done && (_h = _c.return)) _h.call(_c);
                                }
                                finally { if (e_19) throw e_19.error; }
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
            return __generator(this, function (_a) {
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
        return __awaiter(this, void 0, void 0, function () {
            var _a, node, operation;
            return __generator(this, function (_b) {
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
                        node.resetUpdateData();
                        return [2 /*return*/, operation];
                }
            });
        });
    };
    RunningTree.prototype.pushNode = function (path, options) {
        var parent = this.findNode(path);
        (0, assert_1.assert)(parent instanceof ListNode);
        parent.pushNewBorn(options);
    };
    RunningTree.prototype.removeNode = function (parent, path) {
        return __awaiter(this, void 0, void 0, function () {
            var parentNode, node;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        parentNode = this.findNode(parent);
                        node = parentNode.getChild(path);
                        (0, assert_1.assert)(parentNode instanceof ListNode && node instanceof SingleNode); // 现在应该不可能remove一个list吧，未来对list的处理还要细化
                        if (!(node.getAction() !== 'create')) return [3 /*break*/, 2];
                        // 不是增加，说明是删除数据
                        return [4 /*yield*/, this.getAspectWrapper().exec('operate', {
                                entity: node.getEntity(),
                                operation: {
                                    action: 'remove',
                                    data: {},
                                    filter: {
                                        id: node.getFreshValue().id,
                                    },
                                },
                            })];
                    case 1:
                        // 不是增加，说明是删除数据
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        // 删除子结点
                        parentNode.popNewBorn(path);
                        _a.label = 3;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    RunningTree.prototype.resetUpdateData = function (path) {
        var node = this.findNode(path);
        node.resetUpdateData();
    };
    RunningTree.prototype.toggleNode = function (path, nodeData, checked) {
        var node = this.findNode(path);
        (0, assert_1.assert)(node instanceof ListNode);
        node.toggleChild({
            updateData: nodeData,
        }, checked);
    };
    RunningTree.prototype.getRoot = function () {
        return this.root;
    };
    __decorate([
        Feature_1.Action
    ], RunningTree.prototype, "setUpdateData", null);
    __decorate([
        Feature_1.Action
    ], RunningTree.prototype, "setAction", null);
    __decorate([
        Feature_1.Action
    ], RunningTree.prototype, "setForeignKey", null);
    __decorate([
        Feature_1.Action
    ], RunningTree.prototype, "addForeignKeys", null);
    __decorate([
        Feature_1.Action
    ], RunningTree.prototype, "setUniqueForeignKeys", null);
    __decorate([
        Feature_1.Action
    ], RunningTree.prototype, "refresh", null);
    __decorate([
        Feature_1.Action
    ], RunningTree.prototype, "loadMore", null);
    __decorate([
        Feature_1.Action
    ], RunningTree.prototype, "setPageSize", null);
    __decorate([
        Feature_1.Action
    ], RunningTree.prototype, "setCurrentPage", null);
    __decorate([
        Feature_1.Action
    ], RunningTree.prototype, "setNamedFilters", null);
    __decorate([
        Feature_1.Action
    ], RunningTree.prototype, "addNamedFilter", null);
    __decorate([
        Feature_1.Action
    ], RunningTree.prototype, "removeNamedFilter", null);
    __decorate([
        Feature_1.Action
    ], RunningTree.prototype, "removeNamedFilterByName", null);
    __decorate([
        Feature_1.Action
    ], RunningTree.prototype, "setNamedSorters", null);
    __decorate([
        Feature_1.Action
    ], RunningTree.prototype, "addNamedSorter", null);
    __decorate([
        Feature_1.Action
    ], RunningTree.prototype, "removeNamedSorter", null);
    __decorate([
        Feature_1.Action
    ], RunningTree.prototype, "removeNamedSorterByName", null);
    __decorate([
        Feature_1.Action
    ], RunningTree.prototype, "execute", null);
    __decorate([
        Feature_1.Action
    ], RunningTree.prototype, "pushNode", null);
    __decorate([
        Feature_1.Action
    ], RunningTree.prototype, "removeNode", null);
    __decorate([
        Feature_1.Action
    ], RunningTree.prototype, "resetUpdateData", null);
    __decorate([
        Feature_1.Action
    ], RunningTree.prototype, "toggleNode", null);
    return RunningTree;
}(Feature_1.Feature));
exports.RunningTree = RunningTree;
