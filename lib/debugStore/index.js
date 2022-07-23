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
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDebugStore = void 0;
var debugStore_1 = require("./debugStore");
var actionDef_1 = require("oak-domain/lib/store/actionDef");
var assert_1 = require("oak-domain/lib/utils/assert");
function initDataInStore(store, contextBuilder, initialData) {
    return __awaiter(this, void 0, void 0, function () {
        var context_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    store.startInitializing();
                    if (!false) return [3 /*break*/, 1];
                    return [3 /*break*/, 4];
                case 1:
                    context_1 = contextBuilder()(store);
                    return [4 /*yield*/, context_1.begin()];
                case 2:
                    _a.sent();
                    if (initialData) {
                        store.setInitialData(initialData);
                    }
                    return [4 /*yield*/, context_1.commit()];
                case 3:
                    _a.sent();
                    _a.label = 4;
                case 4:
                    store.endInitializing();
                    return [2 /*return*/];
            }
        });
    });
}
function getMaterializedData() {
    if (process.env.OAK_PLATFORM === 'wechatMp') {
        try {
            var data = wx.getStorageSync('debugStore');
            var stat = wx.getStorageSync('debugStoreStat');
            if (data && stat) {
                return {
                    data: data,
                    stat: stat,
                };
            }
            return;
        }
        catch (e) {
            return;
        }
    }
    else if (process.env.OAK_PLATFORM === 'web') {
        try {
            var data = JSON.parse(window.localStorage.getItem('debugStore'));
            var stat = JSON.parse(window.localStorage.getItem('debugStoreStat'));
            if (data && stat) {
                return {
                    data: data,
                    stat: stat,
                };
            }
            return;
        }
        catch (e) {
            return;
        }
    }
}
var lastMaterializedVersion = 0;
function materializeData(data, stat) {
    if (process.env.OAK_PLATFORM === 'wechatMp') {
        try {
            wx.setStorageSync('debugStore', data);
            wx.setStorageSync('debugStoreStat', stat);
            lastMaterializedVersion = stat.commit;
            wx.showToast({
                title: '数据已物化',
                icon: 'success',
            });
            console.log('物化数据', data);
        }
        catch (e) {
            console.error(e);
            wx.showToast({
                title: '物化数据失败',
                icon: 'error',
            });
        }
    }
    else if (process.env.OAK_PLATFORM === 'web') {
        try {
            window.localStorage.setItem('debugStore', typeof data === 'string' ? data : JSON.stringify(data));
            window.localStorage.setItem('debugStoreStat', JSON.stringify(stat));
            lastMaterializedVersion = stat.commit;
            console.log('物化数据', data);
            // alert('数据已物化');
        }
        catch (e) {
            console.error(e);
            // alert('物化数据失败');
        }
    }
}
/**
 * 在debug环境上创建watcher
 * @param store
 * @param watchers
 */
function initializeWatchers(store, contextBuilder, watchers) {
    var count = 0;
    function doWatchers() {
        return __awaiter(this, void 0, void 0, function () {
            var start, context, watchers_1, watchers_1_1, w, _a, entity, action, filter, actionData, filter2, _b, data, _c, result, _d, entity, projection, fn, filter, filter2, _e, projection2, _f, rows, result, err_1, e_1_1, duration;
            var e_1, _g;
            return __generator(this, function (_h) {
                switch (_h.label) {
                    case 0:
                        count++;
                        start = Date.now();
                        context = contextBuilder()(store);
                        _h.label = 1;
                    case 1:
                        _h.trys.push([1, 26, 27, 28]);
                        watchers_1 = __values(watchers), watchers_1_1 = watchers_1.next();
                        _h.label = 2;
                    case 2:
                        if (!!watchers_1_1.done) return [3 /*break*/, 25];
                        w = watchers_1_1.value;
                        return [4 /*yield*/, context.begin()];
                    case 3:
                        _h.sent();
                        _h.label = 4;
                    case 4:
                        _h.trys.push([4, 22, , 24]);
                        if (!w.hasOwnProperty('actionData')) return [3 /*break*/, 12];
                        _a = w, entity = _a.entity, action = _a.action, filter = _a.filter, actionData = _a.actionData;
                        if (!(typeof filter === 'function')) return [3 /*break*/, 6];
                        return [4 /*yield*/, filter()];
                    case 5:
                        _b = _h.sent();
                        return [3 /*break*/, 7];
                    case 6:
                        _b = filter;
                        _h.label = 7;
                    case 7:
                        filter2 = _b;
                        if (!(typeof actionData === 'function')) return [3 /*break*/, 9];
                        return [4 /*yield*/, actionData()];
                    case 8:
                        _c = _h.sent();
                        return [3 /*break*/, 10];
                    case 9:
                        _c = actionData;
                        _h.label = 10;
                    case 10:
                        data = _c;
                        return [4 /*yield*/, store.operate(entity, {
                                action: action,
                                data: data,
                                filter: filter2
                            }, context)];
                    case 11:
                        result = _h.sent();
                        console.log("\u6267\u884C\u4E86watcher\u3010".concat(w.name, "\u3011\uFF0C\u7ED3\u679C\u662F\uFF1A"), result);
                        return [3 /*break*/, 20];
                    case 12:
                        _d = w, entity = _d.entity, projection = _d.projection, fn = _d.fn, filter = _d.filter;
                        if (!(typeof filter === 'function')) return [3 /*break*/, 14];
                        return [4 /*yield*/, filter()];
                    case 13:
                        _e = _h.sent();
                        return [3 /*break*/, 15];
                    case 14:
                        _e = filter;
                        _h.label = 15;
                    case 15:
                        filter2 = _e;
                        if (!(typeof projection === 'function')) return [3 /*break*/, 17];
                        return [4 /*yield*/, projection()];
                    case 16:
                        _f = _h.sent();
                        return [3 /*break*/, 18];
                    case 17:
                        _f = projection;
                        _h.label = 18;
                    case 18:
                        projection2 = _f;
                        return [4 /*yield*/, store.select(entity, {
                                data: projection2,
                                filter: filter2,
                            }, context)];
                    case 19:
                        rows = (_h.sent()).result;
                        result = fn(context, rows);
                        console.log("\u6267\u884C\u4E86watcher\u3010".concat(w.name, "\u3011\uFF0C\u7ED3\u679C\u662F\uFF1A"), result);
                        _h.label = 20;
                    case 20: return [4 /*yield*/, context.commit()];
                    case 21:
                        _h.sent();
                        return [3 /*break*/, 24];
                    case 22:
                        err_1 = _h.sent();
                        return [4 /*yield*/, context.rollback()];
                    case 23:
                        _h.sent();
                        console.error("\u6267\u884C\u4E86watcher\u3010".concat(w.name, "\u3011\uFF0C\u53D1\u751F\u9519\u8BEF\uFF1A"), err_1);
                        return [3 /*break*/, 24];
                    case 24:
                        watchers_1_1 = watchers_1.next();
                        return [3 /*break*/, 2];
                    case 25: return [3 /*break*/, 28];
                    case 26:
                        e_1_1 = _h.sent();
                        e_1 = { error: e_1_1 };
                        return [3 /*break*/, 28];
                    case 27:
                        try {
                            if (watchers_1_1 && !watchers_1_1.done && (_g = watchers_1.return)) _g.call(watchers_1);
                        }
                        finally { if (e_1) throw e_1.error; }
                        return [7 /*endfinally*/];
                    case 28:
                        duration = Date.now() - start;
                        console.log("\u7B2C".concat(count, "\u6B21\u6267\u884Cwatchers\uFF0C\u5171\u6267\u884C").concat(watchers.length, "\u4E2A\uFF0C\u8017\u65F6").concat(duration, "\u6BEB\u79D2"));
                        setTimeout(function () { return doWatchers(); }, 120000);
                        return [2 /*return*/];
                }
            });
        });
    }
    doWatchers();
}
function createDebugStore(storageSchema, contextBuilder, triggers, checkers, watchers, initialData, actionDict) {
    var data = getMaterializedData();
    var store = new debugStore_1.DebugStore(storageSchema, contextBuilder, data && data.data, data && data.stat);
    triggers.forEach(function (ele) { return store.registerTrigger(ele); });
    checkers.forEach(function (ele) { return store.registerChecker(ele); });
    (0, assert_1.assert)(actionDict);
    var _a = (0, actionDef_1.analyzeActionDefDict)(storageSchema, actionDict), adTriggers = _a.triggers, adCheckers = _a.checkers, adWatchers = _a.watchers;
    adTriggers.forEach(function (ele) { return store.registerTrigger(ele); });
    adCheckers.forEach(function (ele) { return store.registerChecker(ele); });
    // 如果没有物化数据则使用initialData初始化debugStore
    if (!data) {
        console.log('使用初始化数据建立debugStore');
        initDataInStore(store, contextBuilder, initialData);
    }
    else {
        console.log('使用物化数据建立debugStore', data);
    }
    lastMaterializedVersion = store.getStat().commit;
    // 启动定期的物化例程
    setInterval(function () {
        var stat = store.getStat();
        if (stat.commit === lastMaterializedVersion) {
            return;
        }
        var data = store.getCurrentData();
        materializeData(data, stat);
    }, 10000);
    // 启动watcher
    initializeWatchers(store, contextBuilder, watchers.concat(adWatchers));
    return store;
}
exports.createDebugStore = createDebugStore;
