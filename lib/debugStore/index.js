"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDebugStore = exports.clearMaterializedData = void 0;
var tslib_1 = require("tslib");
var constant_1 = require("../constant/constant");
var DebugStore_1 = require("./DebugStore");
var actionDef_1 = require("oak-domain/lib/store/actionDef");
var assert_1 = require("oak-domain/lib/utils/assert");
var uuid_1 = require("oak-domain/lib/utils/uuid");
function initDataInStore(store, initialData, stat) {
    return tslib_1.__awaiter(this, void 0, void 0, function () {
        return tslib_1.__generator(this, function (_a) {
            store.resetInitialData(initialData, stat);
            return [2 /*return*/];
        });
    });
}
function getMaterializedData() {
    if (process.env.OAK_PLATFORM === 'wechatMp') {
        try {
            var data = wx.getStorageSync(constant_1.LOCAL_STORAGE_KEYS.debugStore);
            var stat = wx.getStorageSync(constant_1.LOCAL_STORAGE_KEYS.debugStoreStat);
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
            var data = JSON.parse(window.localStorage.getItem(constant_1.LOCAL_STORAGE_KEYS.debugStore));
            var stat = JSON.parse(window.localStorage.getItem(constant_1.LOCAL_STORAGE_KEYS.debugStoreStat));
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
            wx.setStorageSync(constant_1.LOCAL_STORAGE_KEYS.debugStore, data);
            wx.setStorageSync(constant_1.LOCAL_STORAGE_KEYS.debugStoreStat, stat);
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
            window.localStorage.setItem(constant_1.LOCAL_STORAGE_KEYS.debugStore, typeof data === 'string' ? data : JSON.stringify(data));
            window.localStorage.setItem(constant_1.LOCAL_STORAGE_KEYS.debugStoreStat, JSON.stringify(stat));
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
function clearMaterializedData() {
    if (process.env.OAK_PLATFORM === 'wechatMp') {
        try {
            wx.removeStorageSync(constant_1.LOCAL_STORAGE_KEYS.debugStore);
            wx.removeStorageSync(constant_1.LOCAL_STORAGE_KEYS.debugStoreStat);
            lastMaterializedVersion = 0;
            wx.showToast({
                title: '数据已清除',
                icon: 'success',
            });
            console.log('清空数据');
        }
        catch (e) {
            console.error(e);
            wx.showToast({
                title: '清空数据失败',
                icon: 'error',
            });
        }
    }
    else if (process.env.OAK_PLATFORM === 'web') {
        try {
            window.localStorage.removeItem(constant_1.LOCAL_STORAGE_KEYS.debugStore);
            window.localStorage.removeItem(constant_1.LOCAL_STORAGE_KEYS.debugStoreStat);
            lastMaterializedVersion = 0;
            console.log('清空数据');
            // alert('数据已物化');
        }
        catch (e) {
            console.error(e);
            // alert('物化数据失败');
        }
    }
}
exports.clearMaterializedData = clearMaterializedData;
/**
 * 在debug环境上创建watcher
 * @param store
 * @param watchers
 */
function initializeWatchers(store, contextBuilder, watchers) {
    var count = 0;
    function doWatchers() {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var start, context, watchers_1, watchers_1_1, w, _a, entity, action, filter, actionData, filter2, _b, data, _c, result, _d, entity, projection, fn, filter, filter2, _e, projection2, _f, rows, result, err_1, e_1_1, duration;
            var e_1, _g;
            return tslib_1.__generator(this, function (_h) {
                switch (_h.label) {
                    case 0:
                        count++;
                        start = Date.now();
                        return [4 /*yield*/, contextBuilder()(store)];
                    case 1:
                        context = _h.sent();
                        _h.label = 2;
                    case 2:
                        _h.trys.push([2, 28, 29, 30]);
                        watchers_1 = tslib_1.__values(watchers), watchers_1_1 = watchers_1.next();
                        _h.label = 3;
                    case 3:
                        if (!!watchers_1_1.done) return [3 /*break*/, 27];
                        w = watchers_1_1.value;
                        return [4 /*yield*/, context.begin()];
                    case 4:
                        _h.sent();
                        _h.label = 5;
                    case 5:
                        _h.trys.push([5, 24, , 26]);
                        if (!w.hasOwnProperty('actionData')) return [3 /*break*/, 13];
                        _a = w, entity = _a.entity, action = _a.action, filter = _a.filter, actionData = _a.actionData;
                        if (!(typeof filter === 'function')) return [3 /*break*/, 7];
                        return [4 /*yield*/, filter()];
                    case 6:
                        _b = _h.sent();
                        return [3 /*break*/, 8];
                    case 7:
                        _b = filter;
                        _h.label = 8;
                    case 8:
                        filter2 = _b;
                        if (!(typeof actionData === 'function')) return [3 /*break*/, 10];
                        return [4 /*yield*/, actionData()];
                    case 9:
                        _c = _h.sent();
                        return [3 /*break*/, 11];
                    case 10:
                        _c = actionData;
                        _h.label = 11;
                    case 11:
                        data = _c;
                        return [4 /*yield*/, store.operate(entity, {
                                id: (0, uuid_1.generateNewId)(),
                                action: action,
                                data: data,
                                filter: filter2
                            }, context, {
                                dontCollect: true,
                            })];
                    case 12:
                        result = _h.sent();
                        console.log("\u6267\u884C\u4E86watcher\u3010".concat(w.name, "\u3011\uFF0C\u7ED3\u679C\u662F\uFF1A"), result);
                        return [3 /*break*/, 22];
                    case 13:
                        _d = w, entity = _d.entity, projection = _d.projection, fn = _d.fn, filter = _d.filter;
                        if (!(typeof filter === 'function')) return [3 /*break*/, 15];
                        return [4 /*yield*/, filter()];
                    case 14:
                        _e = _h.sent();
                        return [3 /*break*/, 16];
                    case 15:
                        _e = filter;
                        _h.label = 16;
                    case 16:
                        filter2 = _e;
                        if (!(typeof projection === 'function')) return [3 /*break*/, 18];
                        return [4 /*yield*/, projection()];
                    case 17:
                        _f = _h.sent();
                        return [3 /*break*/, 19];
                    case 18:
                        _f = projection;
                        _h.label = 19;
                    case 19:
                        projection2 = _f;
                        return [4 /*yield*/, store.select(entity, {
                                data: projection2,
                                filter: filter2,
                            }, context, {
                                dontCollect: true,
                                blockTrigger: true,
                            })];
                    case 20:
                        rows = _h.sent();
                        return [4 /*yield*/, fn(context, rows)];
                    case 21:
                        result = _h.sent();
                        console.log("\u6267\u884C\u4E86watcher\u3010".concat(w.name, "\u3011\uFF0C\u7ED3\u679C\u662F\uFF1A"), result);
                        _h.label = 22;
                    case 22: return [4 /*yield*/, context.commit()];
                    case 23:
                        _h.sent();
                        return [3 /*break*/, 26];
                    case 24:
                        err_1 = _h.sent();
                        return [4 /*yield*/, context.rollback()];
                    case 25:
                        _h.sent();
                        console.error("\u6267\u884C\u4E86watcher\u3010".concat(w.name, "\u3011\uFF0C\u53D1\u751F\u9519\u8BEF\uFF1A"), err_1);
                        return [3 /*break*/, 26];
                    case 26:
                        watchers_1_1 = watchers_1.next();
                        return [3 /*break*/, 3];
                    case 27: return [3 /*break*/, 30];
                    case 28:
                        e_1_1 = _h.sent();
                        e_1 = { error: e_1_1 };
                        return [3 /*break*/, 30];
                    case 29:
                        try {
                            if (watchers_1_1 && !watchers_1_1.done && (_g = watchers_1.return)) _g.call(watchers_1);
                        }
                        finally { if (e_1) throw e_1.error; }
                        return [7 /*endfinally*/];
                    case 30:
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
/* export function resetDebugStore<ED extends EntityDict & BaseEntityDict, Cxt extends Context<ED>>(
    store: DebugStore<ED, Cxt>,
    data: {
        [T in keyof ED]?: Array<ED[T]['OpSchema']>;
    }
) {
    initDataInStore(store, data, {
        create: 0,
        update: 0,
        remove: 0,
        commit: 0
    });
    materializeData(data, store.getStat());
} */
function createDebugStore(storageSchema, contextBuilder, triggers, checkers, watchers, initialData, actionDict) {
    var store = new DebugStore_1.DebugStore(storageSchema, contextBuilder);
    triggers.forEach(function (ele) { return store.registerTrigger(ele); });
    checkers.forEach(function (ele) { return store.registerChecker(ele); });
    (0, assert_1.assert)(actionDict);
    var _a = (0, actionDef_1.analyzeActionDefDict)(storageSchema, actionDict), adTriggers = _a.triggers, adCheckers = _a.checkers, adWatchers = _a.watchers;
    adTriggers.forEach(function (ele) { return store.registerTrigger(ele); });
    adCheckers.forEach(function (ele) { return store.registerChecker(ele); });
    // 如果没有物化数据则使用initialData初始化debugStore
    var data = getMaterializedData();
    if (!data) {
        initDataInStore(store, initialData);
        console.log('使用初始化数据建立debugStore', initialData);
    }
    else {
        initDataInStore(store, data.data, data.stat);
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
