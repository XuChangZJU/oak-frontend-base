"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDebugStore = exports.clearMaterializedData = void 0;
var tslib_1 = require("tslib");
var debugStore_1 = require("./debugStore");
var actionDef_1 = require("oak-domain/lib/store/actionDef");
var assert_1 = require("oak-domain/lib/utils/assert");
function initDataInStore(store, initialData, stat) {
    return tslib_1.__awaiter(this, void 0, void 0, function () {
        return tslib_1.__generator(this, function (_a) {
            store.startInitializing();
            store.resetInitialData(initialData, stat);
            store.endInitializing();
            return [2 /*return*/];
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
function clearMaterializedData() {
    if (process.env.OAK_PLATFORM === 'wechatMp') {
        try {
            wx.removeStorageSync('debugStore');
            wx.removeStorageSync('debugStoreStat');
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
            window.localStorage.removeItem('debugStore');
            window.localStorage.removeItem('debugStoreStat');
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
            var start, context, watchers_1, watchers_1_1, w, _a, entity, action, filter, actionData, filter2, _b, data, _c, result, _d, _e, _f, _g, entity, projection, fn, filter, filter2, _h, projection2, _j, rows, result, err_1, e_1_1, duration;
            var e_1, _k, _l;
            return tslib_1.__generator(this, function (_m) {
                switch (_m.label) {
                    case 0:
                        count++;
                        start = Date.now();
                        context = contextBuilder()(store);
                        _m.label = 1;
                    case 1:
                        _m.trys.push([1, 27, 28, 29]);
                        watchers_1 = tslib_1.__values(watchers), watchers_1_1 = watchers_1.next();
                        _m.label = 2;
                    case 2:
                        if (!!watchers_1_1.done) return [3 /*break*/, 26];
                        w = watchers_1_1.value;
                        return [4 /*yield*/, context.begin()];
                    case 3:
                        _m.sent();
                        _m.label = 4;
                    case 4:
                        _m.trys.push([4, 23, , 25]);
                        if (!w.hasOwnProperty('actionData')) return [3 /*break*/, 13];
                        _a = w, entity = _a.entity, action = _a.action, filter = _a.filter, actionData = _a.actionData;
                        if (!(typeof filter === 'function')) return [3 /*break*/, 6];
                        return [4 /*yield*/, filter()];
                    case 5:
                        _b = _m.sent();
                        return [3 /*break*/, 7];
                    case 6:
                        _b = filter;
                        _m.label = 7;
                    case 7:
                        filter2 = _b;
                        if (!(typeof actionData === 'function')) return [3 /*break*/, 9];
                        return [4 /*yield*/, actionData()];
                    case 8:
                        _c = _m.sent();
                        return [3 /*break*/, 10];
                    case 9:
                        _c = actionData;
                        _m.label = 10;
                    case 10:
                        data = _c;
                        _e = (_d = store).operate;
                        _f = [entity];
                        _l = {};
                        return [4 /*yield*/, generateNewId()];
                    case 11: return [4 /*yield*/, _e.apply(_d, _f.concat([(_l.id = _m.sent(),
                                _l.action = action,
                                _l.data = data,
                                _l.filter = filter2,
                                _l), context, {
                                dontCollect: true,
                            }]))];
                    case 12:
                        result = _m.sent();
                        console.log("\u6267\u884C\u4E86watcher\u3010".concat(w.name, "\u3011\uFF0C\u7ED3\u679C\u662F\uFF1A"), result);
                        return [3 /*break*/, 21];
                    case 13:
                        _g = w, entity = _g.entity, projection = _g.projection, fn = _g.fn, filter = _g.filter;
                        if (!(typeof filter === 'function')) return [3 /*break*/, 15];
                        return [4 /*yield*/, filter()];
                    case 14:
                        _h = _m.sent();
                        return [3 /*break*/, 16];
                    case 15:
                        _h = filter;
                        _m.label = 16;
                    case 16:
                        filter2 = _h;
                        if (!(typeof projection === 'function')) return [3 /*break*/, 18];
                        return [4 /*yield*/, projection()];
                    case 17:
                        _j = _m.sent();
                        return [3 /*break*/, 19];
                    case 18:
                        _j = projection;
                        _m.label = 19;
                    case 19:
                        projection2 = _j;
                        return [4 /*yield*/, store.select(entity, {
                                data: projection2,
                                filter: filter2,
                            }, context, {
                                dontCollect: true,
                            })];
                    case 20:
                        rows = (_m.sent()).result;
                        result = fn(context, rows);
                        console.log("\u6267\u884C\u4E86watcher\u3010".concat(w.name, "\u3011\uFF0C\u7ED3\u679C\u662F\uFF1A"), result);
                        _m.label = 21;
                    case 21: return [4 /*yield*/, context.commit()];
                    case 22:
                        _m.sent();
                        return [3 /*break*/, 25];
                    case 23:
                        err_1 = _m.sent();
                        return [4 /*yield*/, context.rollback()];
                    case 24:
                        _m.sent();
                        console.error("\u6267\u884C\u4E86watcher\u3010".concat(w.name, "\u3011\uFF0C\u53D1\u751F\u9519\u8BEF\uFF1A"), err_1);
                        return [3 /*break*/, 25];
                    case 25:
                        watchers_1_1 = watchers_1.next();
                        return [3 /*break*/, 2];
                    case 26: return [3 /*break*/, 29];
                    case 27:
                        e_1_1 = _m.sent();
                        e_1 = { error: e_1_1 };
                        return [3 /*break*/, 29];
                    case 28:
                        try {
                            if (watchers_1_1 && !watchers_1_1.done && (_k = watchers_1.return)) _k.call(watchers_1);
                        }
                        finally { if (e_1) throw e_1.error; }
                        return [7 /*endfinally*/];
                    case 29:
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
    var store = new debugStore_1.DebugStore(storageSchema, contextBuilder);
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
