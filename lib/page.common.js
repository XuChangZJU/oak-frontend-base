"use strict";
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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
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
exports.makePageMethods = exports.makeListComponentMethods = exports.makeCommonComponentMethods = exports.makeHiddenComponentMethods = void 0;
var assert_1 = require("oak-domain/lib/utils/assert");
var types_1 = require("oak-domain/lib/types");
var Feature_1 = require("./types/Feature");
function makeHiddenComponentMethods() {
    return {
        subscribe: function () {
            var _this = this;
            if (!this.subscribed) {
                this.subscribed = (0, Feature_1.subscribe)(function () { return _this.reRender(); });
            }
        },
        unsubscribe: function () {
            if (this.subscribed) {
                this.subscribed();
                this.subscribed = undefined;
            }
        },
    };
}
exports.makeHiddenComponentMethods = makeHiddenComponentMethods;
function makeCommonComponentMethods(features, exceptionRouterDict, formData) {
    return {
        sub: function (type, callback) {
            features.eventBus.sub(type, callback);
        },
        unsub: function (type, callback) {
            features.eventBus.unsub(type, callback);
        },
        pub: function (type, options) {
            features.eventBus.pub(type, options);
        },
        unsubAll: function (type) {
            features.eventBus.unsubAll(type);
        },
        save: function (key, item) {
            features.localStorage.save(key, item);
        },
        load: function (key) {
            return features.localStorage.load(key);
        },
        clear: function () {
            features.localStorage.clear();
        },
        setNotification: function (data) {
            features.notification.setNotification(data);
        },
        consumeNotification: function () {
            return features.notification.consumeNotification();
        },
        setMessage: function (data) {
            features.message.setMessage(data);
        },
        consumeMessage: function () {
            return features.message.consumeMessage();
        },
        reRender: function (extra) {
            return __awaiter(this, void 0, void 0, function () {
                var rows, dirty, oakLegalActions, _a, _b, action, e_1, e_2_1, data, _c, k, data, _d;
                var e_2, _e, _f;
                return __generator(this, function (_g) {
                    switch (_g.label) {
                        case 0:
                            if (!(this.state.oakEntity && this.state.oakFullpath)) return [3 /*break*/, 14];
                            rows = features.runningTree.getFreshValue(this.state.oakFullpath);
                            dirty = features.runningTree.isDirty(this.state.oakFullpath);
                            oakLegalActions = [];
                            if (!this.state.newOakActions) return [3 /*break*/, 10];
                            _g.label = 1;
                        case 1:
                            _g.trys.push([1, 8, 9, 10]);
                            _a = __values(this.state.newOakActions), _b = _a.next();
                            _g.label = 2;
                        case 2:
                            if (!!_b.done) return [3 /*break*/, 7];
                            action = _b.value;
                            _g.label = 3;
                        case 3:
                            _g.trys.push([3, 5, , 6]);
                            return [4 /*yield*/, features.runningTree.testAction(this.state.oakFullpath, action)];
                        case 4:
                            _g.sent();
                            oakLegalActions.push(action);
                            return [3 /*break*/, 6];
                        case 5:
                            e_1 = _g.sent();
                            if (e_1 instanceof types_1.OakInputIllegalException) {
                                oakLegalActions.push(action);
                            }
                            return [3 /*break*/, 6];
                        case 6:
                            _b = _a.next();
                            return [3 /*break*/, 2];
                        case 7: return [3 /*break*/, 10];
                        case 8:
                            e_2_1 = _g.sent();
                            e_2 = { error: e_2_1 };
                            return [3 /*break*/, 10];
                        case 9:
                            try {
                                if (_b && !_b.done && (_e = _a.return)) _e.call(_a);
                            }
                            finally { if (e_2) throw e_2.error; }
                            return [7 /*endfinally*/];
                        case 10:
                            if (!formData) return [3 /*break*/, 12];
                            return [4 /*yield*/, formData.call(this, {
                                    data: rows,
                                    features: features,
                                    props: this.props,
                                    legalActions: oakLegalActions,
                                })];
                        case 11:
                            _c = _g.sent();
                            return [3 /*break*/, 13];
                        case 12:
                            _c = {};
                            _g.label = 13;
                        case 13:
                            data = _c;
                            for (k in data) {
                                if (data[k] === undefined) {
                                    Object.assign(data, (_f = {},
                                        _f[k] = null,
                                        _f));
                                }
                            }
                            Object.assign(data, { oakDirty: dirty });
                            if (extra) {
                                Object.assign(data, extra);
                            }
                            Object.assign(data, {
                                oakLegalActions: oakLegalActions,
                            });
                            this.setState(data);
                            return [3 /*break*/, 18];
                        case 14:
                            if (!formData) return [3 /*break*/, 16];
                            return [4 /*yield*/, formData.call(this, {
                                    features: features,
                                    props: this.props,
                                })];
                        case 15:
                            _d = _g.sent();
                            return [3 /*break*/, 17];
                        case 16:
                            _d = {};
                            _g.label = 17;
                        case 17:
                            data = _d;
                            if (extra) {
                                Object.assign(data, extra);
                            }
                            this.setState(data);
                            _g.label = 18;
                        case 18: return [2 /*return*/];
                    }
                });
            });
        },
        callPicker: function (attr, params) {
            if (this.state.oakExecuting) {
                return;
            }
            var relation = features.cache.judgeRelation(this.state.oakEntity, attr);
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
        },
        setForeignKey: function (id, goBackDelta) {
            if (goBackDelta === void 0) { goBackDelta = -1; }
            if (this.state.oakExecuting) {
                return;
            }
            var _a = this.state, oakIsPicker = _a.oakIsPicker, oakParent = _a.oakParent, oakPath = _a.oakPath;
            (0, assert_1.assert)(oakIsPicker);
            features.runningTree.setForeignKey(oakParent, oakPath, id);
            if (goBackDelta !== 0) {
                this.navigateBack({
                    delta: goBackDelta,
                });
            }
        },
        addForeignKeys: function (ids, goBackDelta) {
            if (goBackDelta === void 0) { goBackDelta = -1; }
            if (this.state.oakExecuting) {
                return;
            }
            var _a = this.state, oakIsPicker = _a.oakIsPicker, oakParent = _a.oakParent, oakPath = _a.oakPath;
            (0, assert_1.assert)(oakIsPicker);
            features.runningTree.addForeignKeys(oakParent, oakPath, ids);
            if (goBackDelta !== 0) {
                this.navigateBack({
                    delta: goBackDelta,
                });
            }
        },
        setUniqueForeignKeys: function (ids, goBackDelta) {
            if (goBackDelta === void 0) { goBackDelta = -1; }
            if (this.state.oakExecuting) {
                return;
            }
            var _a = this.state, oakIsPicker = _a.oakIsPicker, oakParent = _a.oakParent, oakPath = _a.oakPath;
            (0, assert_1.assert)(oakIsPicker);
            features.runningTree.setUniqueForeignKeys(oakParent, oakPath, ids);
            if (goBackDelta !== 0) {
                this.navigateBack({
                    delta: goBackDelta,
                });
            }
        },
        toggleNode: function (nodeData, checked, path) {
            var fullpath = path
                ? "".concat(this.state.oakFullpath, ".").concat(path)
                : this.state.oakFullpath;
            features.runningTree.toggleNode(fullpath, nodeData, checked);
        },
        execute: function (action, legalExceptions, path) {
            return __awaiter(this, void 0, void 0, function () {
                var fullpath, result, err_1, attr, name_1, handler, hidden, level, fn, router;
                var _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            if (this.state.oakExecuting) {
                                return [2 /*return*/];
                            }
                            this.setState({
                                oakExecuting: true,
                                oakFocused: {},
                            });
                            _b.label = 1;
                        case 1:
                            _b.trys.push([1, 3, , 4]);
                            fullpath = path
                                ? "".concat(this.state.oakFullpath, ".").concat(path)
                                : this.state.oakFullpath;
                            return [4 /*yield*/, features.runningTree.execute(fullpath, action)];
                        case 2:
                            result = _b.sent();
                            this.setState({ oakExecuting: false });
                            this.setMessage({
                                type: 'success',
                                content: '操作成功',
                            });
                            return [2 /*return*/, result];
                        case 3:
                            err_1 = _b.sent();
                            if (err_1 instanceof types_1.OakException) {
                                if (err_1 instanceof types_1.OakInputIllegalException) {
                                    attr = err_1.getAttributes()[0];
                                    this.setState({
                                        oakFocused: (_a = {},
                                            _a[attr] = true,
                                            _a),
                                        oakExecuting: false,
                                    });
                                    this.setMessage({
                                        type: 'warning',
                                        content: err_1.message,
                                    });
                                }
                                else {
                                    name_1 = err_1.constructor.name;
                                    handler = exceptionRouterDict[name_1];
                                    if (legalExceptions && legalExceptions.includes(name_1)) {
                                        // 如果调用时就知道有异常，直接抛出
                                        this.setState({
                                            oakExecuting: false,
                                        });
                                        throw err_1;
                                    }
                                    else if (handler) {
                                        hidden = handler.hidden, level = handler.level, fn = handler.handler, router = handler.router;
                                        if (!hidden) {
                                            this.setState({
                                                oakExecuting: false,
                                            });
                                            this.setMessage({
                                                type: level || 'warning',
                                                content: err_1.message,
                                            });
                                        }
                                        else {
                                            this.setState({
                                                oakExecuting: false,
                                            });
                                        }
                                        if (fn) {
                                            fn(err_1);
                                            return [2 /*return*/];
                                        }
                                        else if (router) {
                                            this.setState({
                                                oakExecuting: false,
                                            });
                                            this.navigateTo({
                                                url: router,
                                                exception: err_1.toString(),
                                            });
                                        }
                                    }
                                    else {
                                        this.setState({
                                            oakExecuting: false,
                                        });
                                        this.setMessage({
                                            type: 'warning',
                                            content: err_1.message,
                                        });
                                    }
                                }
                            }
                            else {
                                this.setState({
                                    oakExecuting: false,
                                });
                                this.setMessage({
                                    type: 'warning',
                                    content: err_1.message,
                                });
                            }
                            throw err_1;
                        case 4: return [2 /*return*/];
                    }
                });
            });
        },
        resetUpdateData: function () {
            return features.runningTree.resetUpdateData(this.state.oakFullpath);
        },
        setAction: function (action, path) {
            var fullpath = path
                ? "".concat(this.state.oakFullpath, ".").concat(path)
                : this.state.oakFullpath;
            return features.runningTree.setAction(fullpath, action);
        },
        setUpdateData: function (attr, value) {
            if (this.state.oakExecuting) {
                return;
            }
            return features.runningTree.setUpdateData(this.state.oakFullpath, attr, value);
        },
    };
}
exports.makeCommonComponentMethods = makeCommonComponentMethods;
function makeListComponentMethods(features) {
    return {
        pushNode: function (path, options) {
            var path2 = path
                ? "".concat(this.state.oakFullpath, ".").concat(path)
                : this.state.oakFullpath;
            features.runningTree.pushNode(path2, options || {});
        },
        removeNode: function (parent, path) {
            var path2 = parent
                ? "".concat(this.state.oakFullpath, ".").concat(parent)
                : this.state.oakFullpath;
            features.runningTree.removeNode(path2, path);
        },
        getFilters: function () {
            return __awaiter(this, void 0, void 0, function () {
                var namedFilters, filters;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            namedFilters = features.runningTree.getNamedFilters(this.state.oakFullpath);
                            return [4 /*yield*/, Promise.all(namedFilters.map(function (_a) {
                                    var filter = _a.filter;
                                    if (typeof filter === 'function') {
                                        return filter();
                                    }
                                    return filter;
                                }))];
                        case 1:
                            filters = _a.sent();
                            return [2 /*return*/, filters];
                    }
                });
            });
        },
        getFilterByName: function (name) {
            return __awaiter(this, void 0, void 0, function () {
                var filter;
                return __generator(this, function (_a) {
                    filter = features.runningTree.getNamedFilterByName(this.state.oakFullpath, name);
                    if (filter === null || filter === void 0 ? void 0 : filter.filter) {
                        if (typeof filter.filter === 'function') {
                            return [2 /*return*/, filter.filter()];
                        }
                        return [2 /*return*/, filter.filter];
                    }
                    return [2 /*return*/];
                });
            });
        },
        addNamedFilter: function (namedFilter, refresh) {
            if (refresh === void 0) { refresh = false; }
            return features.runningTree.addNamedFilter(this.state.oakFullpath, namedFilter, refresh);
        },
        removeNamedFilter: function (namedFilter, refresh) {
            if (refresh === void 0) { refresh = false; }
            return features.runningTree.removeNamedFilter(this.state.oakFullpath, namedFilter, refresh);
        },
        removeNamedFilterByName: function (name, refresh) {
            if (refresh === void 0) { refresh = false; }
            return features.runningTree.removeNamedFilterByName(this.state.oakFullpath, name, refresh);
        },
        setNamedSorters: function (namedSorters) {
            return features.runningTree.setNamedSorters(this.state.oakFullpath, namedSorters);
        },
        getSorters: function () {
            return __awaiter(this, void 0, void 0, function () {
                var namedSorters, sorters;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            namedSorters = features.runningTree.getNamedSorters(this.state.oakFullpath);
                            return [4 /*yield*/, Promise.all(namedSorters.map(function (_a) {
                                    var sorter = _a.sorter;
                                    if (typeof sorter === 'function') {
                                        return sorter();
                                    }
                                    return sorter;
                                }))];
                        case 1:
                            sorters = (_a.sent()).filter(function (ele) { return !!ele; });
                            return [2 /*return*/, sorters];
                    }
                });
            });
        },
        getSorterByName: function (name) {
            return __awaiter(this, void 0, void 0, function () {
                var sorter;
                return __generator(this, function (_a) {
                    sorter = features.runningTree.getNamedSorterByName(this.state.oakFullpath, name);
                    if (sorter === null || sorter === void 0 ? void 0 : sorter.sorter) {
                        if (typeof sorter.sorter === 'function') {
                            return [2 /*return*/, sorter.sorter()];
                        }
                        return [2 /*return*/, sorter.sorter];
                    }
                    return [2 /*return*/];
                });
            });
        },
        addNamedSorter: function (namedSorter, refresh) {
            if (refresh === void 0) { refresh = false; }
            return features.runningTree.addNamedSorter(this.state.oakFullpath, namedSorter, refresh);
        },
        removeNamedSorter: function (namedSorter, refresh) {
            if (refresh === void 0) { refresh = false; }
            return features.runningTree.removeNamedSorter(this.state.oakFullpath, namedSorter, refresh);
        },
        removeNamedSorterByName: function (name, refresh) {
            if (refresh === void 0) { refresh = false; }
            return features.runningTree.removeNamedSorterByName(this.state.oakFullpath, name, refresh);
        },
        setFilters: function (filters) {
            return features.runningTree.setNamedFilters(this.state.oakFullpath, filters);
        },
        getPagination: function () {
            return features.runningTree.getPagination(this.state.oakFullpath);
        },
        setPageSize: function (pageSize, refresh) {
            if (refresh === void 0) { refresh = true; }
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, features.runningTree.setPageSize(this.state.oakFullpath, pageSize, refresh)];
                        case 1: return [2 /*return*/, _a.sent()];
                    }
                });
            });
        },
        setCurrentPage: function (currentPage) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            (0, assert_1.assert)(currentPage !== 0);
                            return [4 /*yield*/, features.runningTree.setCurrentPage(this.state.oakFullpath, currentPage)];
                        case 1: return [2 /*return*/, _a.sent()];
                    }
                });
            });
        },
    };
}
exports.makeListComponentMethods = makeListComponentMethods;
function makePageMethods(features, options, context) {
    return {
        refresh: function () {
            return __awaiter(this, void 0, void 0, function () {
                var err_2;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!(this.state.oakEntity && this.state.oakFullpath)) return [3 /*break*/, 4];
                            this.setState({
                                oakLoading: true,
                            });
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 3, , 4]);
                            return [4 /*yield*/, features.runningTree.refresh(this.state.oakFullpath)];
                        case 2:
                            _a.sent();
                            this.setState({
                                oakLoading: false,
                            });
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
        },
        onPullDownRefresh: function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.refresh()];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        },
        loadMore: function () {
            return __awaiter(this, void 0, void 0, function () {
                var err_3;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!(this.state.oakEntity && options.isList)) return [3 /*break*/, 4];
                            this.setState({
                                oakMoreLoading: true,
                            });
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 3, , 4]);
                            return [4 /*yield*/, features.runningTree.loadMore(this.state.oakFullpath)];
                        case 2:
                            _a.sent();
                            this.setState({
                                oakMoreLoading: false,
                            });
                            return [3 /*break*/, 4];
                        case 3:
                            err_3 = _a.sent();
                            this.setState({
                                oakMoreLoading: false,
                            });
                            this.setMessage({
                                type: 'error',
                                content: err_3.message,
                            });
                            return [3 /*break*/, 4];
                        case 4: return [2 /*return*/];
                    }
                });
            });
        },
        onReachBottom: function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.loadMore()];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        },
        onLoad: function (pageOption) {
            return __awaiter(this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    return [2 /*return*/, new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
                            var _a, oakId, oakEntity, oakPath, oakProjection, oakParent, oakSorters, oakFilters, oakIsPicker, oakFrom, oakActions, props, filters, oakFilters2, _loop_1, _b, _c, ele, proj, projection_1, sorters, oakSorters2, _loop_2, _d, _e, ele, oakPath2, path2_1, node, _f, e_3;
                            var e_4, _g, e_5, _h;
                            var _this = this;
                            var _j;
                            return __generator(this, function (_k) {
                                switch (_k.label) {
                                    case 0:
                                        _k.trys.push([0, 7, , 8]);
                                        _a = this.props, oakId = _a.oakId, oakEntity = _a.oakEntity, oakPath = _a.oakPath, oakProjection = _a.oakProjection, oakParent = _a.oakParent, oakSorters = _a.oakSorters, oakFilters = _a.oakFilters, oakIsPicker = _a.oakIsPicker, oakFrom = _a.oakFrom, oakActions = _a.oakActions, props = __rest(_a, ["oakId", "oakEntity", "oakPath", "oakProjection", "oakParent", "oakSorters", "oakFilters", "oakIsPicker", "oakFrom", "oakActions"]);
                                        if (!(oakEntity || options.entity)) return [3 /*break*/, 3];
                                        (0, assert_1.assert)(!(options.isList && oakId));
                                        filters = [];
                                        if ((oakFilters === null || oakFilters === void 0 ? void 0 : oakFilters.length) > 0) {
                                            oakFilters2 = JSON.parse(oakFilters);
                                            filters.push.apply(filters, __spreadArray([], __read(oakFilters2), false));
                                        }
                                        else if (options.filters) {
                                            _loop_1 = function (ele) {
                                                var _l;
                                                var filter = ele.filter, name_2 = ele["#name"];
                                                filters.push((_l = {
                                                        filter: typeof filter === 'function'
                                                            ? function () {
                                                                return filter({
                                                                    features: features,
                                                                    props: _this.props,
                                                                    onLoadOptions: pageOption,
                                                                });
                                                            }
                                                            : filter
                                                    },
                                                    _l['#name'] = name_2,
                                                    _l));
                                            };
                                            try {
                                                for (_b = __values(options.filters), _c = _b.next(); !_c.done; _c = _b.next()) {
                                                    ele = _c.value;
                                                    _loop_1(ele);
                                                }
                                            }
                                            catch (e_4_1) { e_4 = { error: e_4_1 }; }
                                            finally {
                                                try {
                                                    if (_c && !_c.done && (_g = _b.return)) _g.call(_b);
                                                }
                                                finally { if (e_4) throw e_4.error; }
                                            }
                                        }
                                        proj = oakProjection && JSON.parse(oakProjection);
                                        if (!proj && options.projection) {
                                            projection_1 = options.projection;
                                            proj =
                                                typeof projection_1 === 'function'
                                                    ? function () {
                                                        return projection_1({
                                                            features: features,
                                                            props: _this.props,
                                                            onLoadOptions: pageOption,
                                                        });
                                                    }
                                                    : projection_1;
                                        }
                                        sorters = [];
                                        if ((oakSorters === null || oakSorters === void 0 ? void 0 : oakSorters.length) > 0) {
                                            oakSorters2 = JSON.parse(oakSorters);
                                            sorters.push.apply(sorters, __spreadArray([], __read(oakSorters2), false));
                                        }
                                        else if (options.sorters) {
                                            _loop_2 = function (ele) {
                                                var _m;
                                                var sorter = ele.sorter, name_3 = ele["#name"];
                                                sorters.push((_m = {
                                                        sorter: typeof sorter === 'function'
                                                            ? function () {
                                                                return sorter({
                                                                    features: features,
                                                                    props: _this.props,
                                                                    onLoadOptions: pageOption,
                                                                });
                                                            }
                                                            : sorter
                                                    },
                                                    _m['#name'] = name_3,
                                                    _m));
                                            };
                                            try {
                                                for (_d = __values(options.sorters), _e = _d.next(); !_e.done; _e = _d.next()) {
                                                    ele = _e.value;
                                                    _loop_2(ele);
                                                }
                                            }
                                            catch (e_5_1) { e_5 = { error: e_5_1 }; }
                                            finally {
                                                try {
                                                    if (_e && !_e.done && (_h = _d.return)) _h.call(_d);
                                                }
                                                finally { if (e_5) throw e_5.error; }
                                            }
                                        }
                                        oakPath2 = oakPath || options.path;
                                        (0, assert_1.assert)(oakPath2);
                                        path2_1 = oakParent
                                            ? "".concat(oakParent, ":").concat(oakPath2)
                                            : oakPath2;
                                        return [4 /*yield*/, features.runningTree.createNode({
                                                path: path2_1,
                                                entity: (oakEntity || options.entity),
                                                isList: options.isList,
                                                isPicker: oakIsPicker,
                                                projection: proj,
                                                pagination: options.pagination,
                                                filters: filters,
                                                sorters: sorters,
                                                id: oakId,
                                            })];
                                    case 1:
                                        node = _k.sent();
                                        // const oakFullpath = oakParent ? `${oakParent}.${oakPath || options.path}` : oakPath || options.path;
                                        return [4 /*yield*/, this.setState({
                                                oakEntity: node.getEntity(),
                                                oakFullpath: path2_1,
                                                oakFrom: oakFrom,
                                                newOakActions: oakActions &&
                                                    JSON.parse(oakActions).length > 0
                                                    ? JSON.parse(oakActions)
                                                    : options.actions || [],
                                            }, function () { return __awaiter(_this, void 0, void 0, function () {
                                                var _a;
                                                var _b;
                                                return __generator(this, function (_c) {
                                                    switch (_c.label) {
                                                        case 0:
                                                            context.setScene(path2_1);
                                                            this.refresh();
                                                            _a = ((_b = options.methods) === null || _b === void 0 ? void 0 : _b.onLoad);
                                                            if (!_a) return [3 /*break*/, 2];
                                                            return [4 /*yield*/, options.methods.onLoad.call(this, pageOption)];
                                                        case 1:
                                                            _a = (_c.sent());
                                                            _c.label = 2;
                                                        case 2:
                                                            _a;
                                                            resolve();
                                                            return [2 /*return*/];
                                                    }
                                                });
                                            }); })];
                                    case 2:
                                        // const oakFullpath = oakParent ? `${oakParent}.${oakPath || options.path}` : oakPath || options.path;
                                        _k.sent();
                                        return [3 /*break*/, 6];
                                    case 3:
                                        _f = ((_j = options.methods) === null || _j === void 0 ? void 0 : _j.onLoad);
                                        if (!_f) return [3 /*break*/, 5];
                                        return [4 /*yield*/, options.methods.onLoad.call(this, pageOption)];
                                    case 4:
                                        _f = (_k.sent());
                                        _k.label = 5;
                                    case 5:
                                        _f;
                                        resolve();
                                        _k.label = 6;
                                    case 6: return [3 /*break*/, 8];
                                    case 7:
                                        e_3 = _k.sent();
                                        reject(e_3);
                                        return [3 /*break*/, 8];
                                    case 8: return [2 /*return*/];
                                }
                            });
                        }); })];
                });
            });
        },
    };
}
exports.makePageMethods = makePageMethods;
