"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDebugStore = exports.clearMaterializedData = void 0;
var tslib_1 = require("tslib");
var node_schedule_1 = require("node-schedule");
var constant_1 = require("../constant/constant");
var DebugStore_1 = require("./DebugStore");
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
function getMaterializedData(loadFn) {
    try {
        var data = loadFn(constant_1.LOCAL_STORAGE_KEYS.debugStore);
        var stat = loadFn(constant_1.LOCAL_STORAGE_KEYS.debugStoreStat);
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
var lastMaterializedVersion = 0;
function materializeData(data, stat, saveFn) {
    try {
        saveFn(constant_1.LOCAL_STORAGE_KEYS.debugStore, data);
        saveFn(constant_1.LOCAL_STORAGE_KEYS.debugStoreStat, stat);
        lastMaterializedVersion = stat.commit;
        console.log('物化数据', data);
    }
    catch (e) {
        console.error(e);
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
            var start, context, watchers_1, watchers_1_1, w, _a, entity, action, filter, actionData, filter2, _b, data, _c, result, _d, _e, _f, _g, entity, projection, fn, filter, filter2, _h, projection2, _j, rows, result, err_1, e_1_1, duration;
            var e_1, _k, _l;
            return tslib_1.__generator(this, function (_m) {
                switch (_m.label) {
                    case 0:
                        count++;
                        start = Date.now();
                        return [4 /*yield*/, contextBuilder()(store)];
                    case 1:
                        context = _m.sent();
                        _m.label = 2;
                    case 2:
                        _m.trys.push([2, 29, 30, 31]);
                        watchers_1 = tslib_1.__values(watchers), watchers_1_1 = watchers_1.next();
                        _m.label = 3;
                    case 3:
                        if (!!watchers_1_1.done) return [3 /*break*/, 28];
                        w = watchers_1_1.value;
                        return [4 /*yield*/, context.begin()];
                    case 4:
                        _m.sent();
                        _m.label = 5;
                    case 5:
                        _m.trys.push([5, 25, , 27]);
                        if (!w.hasOwnProperty('actionData')) return [3 /*break*/, 14];
                        _a = w, entity = _a.entity, action = _a.action, filter = _a.filter, actionData = _a.actionData;
                        if (!(typeof filter === 'function')) return [3 /*break*/, 7];
                        return [4 /*yield*/, filter()];
                    case 6:
                        _b = _m.sent();
                        return [3 /*break*/, 8];
                    case 7:
                        _b = filter;
                        _m.label = 8;
                    case 8:
                        filter2 = _b;
                        if (!(typeof actionData === 'function')) return [3 /*break*/, 10];
                        return [4 /*yield*/, actionData()];
                    case 9:
                        _c = _m.sent();
                        return [3 /*break*/, 11];
                    case 10:
                        _c = actionData;
                        _m.label = 11;
                    case 11:
                        data = _c;
                        _e = (_d = store).operate;
                        _f = [entity];
                        _l = {};
                        return [4 /*yield*/, (0, uuid_1.generateNewIdAsync)()];
                    case 12: return [4 /*yield*/, _e.apply(_d, _f.concat([(_l.id = _m.sent(),
                                _l.action = action,
                                _l.data = data,
                                _l.filter = filter2,
                                _l), context, {
                                dontCollect: true,
                            }]))];
                    case 13:
                        result = _m.sent();
                        console.log("\u6267\u884C\u4E86watcher\u3010".concat(w.name, "\u3011\uFF0C\u7ED3\u679C\u662F\uFF1A"), result);
                        return [3 /*break*/, 23];
                    case 14:
                        _g = w, entity = _g.entity, projection = _g.projection, fn = _g.fn, filter = _g.filter;
                        if (!(typeof filter === 'function')) return [3 /*break*/, 16];
                        return [4 /*yield*/, filter()];
                    case 15:
                        _h = _m.sent();
                        return [3 /*break*/, 17];
                    case 16:
                        _h = filter;
                        _m.label = 17;
                    case 17:
                        filter2 = _h;
                        if (!(typeof projection === 'function')) return [3 /*break*/, 19];
                        return [4 /*yield*/, projection()];
                    case 18:
                        _j = _m.sent();
                        return [3 /*break*/, 20];
                    case 19:
                        _j = projection;
                        _m.label = 20;
                    case 20:
                        projection2 = _j;
                        return [4 /*yield*/, store.select(entity, {
                                data: projection2,
                                filter: filter2,
                            }, context, {
                                dontCollect: true,
                                blockTrigger: true,
                            })];
                    case 21:
                        rows = _m.sent();
                        return [4 /*yield*/, fn(context, rows)];
                    case 22:
                        result = _m.sent();
                        console.log("\u6267\u884C\u4E86watcher\u3010".concat(w.name, "\u3011\uFF0C\u7ED3\u679C\u662F\uFF1A"), result);
                        _m.label = 23;
                    case 23: return [4 /*yield*/, context.commit()];
                    case 24:
                        _m.sent();
                        return [3 /*break*/, 27];
                    case 25:
                        err_1 = _m.sent();
                        return [4 /*yield*/, context.rollback()];
                    case 26:
                        _m.sent();
                        console.error("\u6267\u884C\u4E86watcher\u3010".concat(w.name, "\u3011\uFF0C\u53D1\u751F\u9519\u8BEF\uFF1A"), err_1);
                        return [3 /*break*/, 27];
                    case 27:
                        watchers_1_1 = watchers_1.next();
                        return [3 /*break*/, 3];
                    case 28: return [3 /*break*/, 31];
                    case 29:
                        e_1_1 = _m.sent();
                        e_1 = { error: e_1_1 };
                        return [3 /*break*/, 31];
                    case 30:
                        try {
                            if (watchers_1_1 && !watchers_1_1.done && (_k = watchers_1.return)) _k.call(watchers_1);
                        }
                        finally { if (e_1) throw e_1.error; }
                        return [7 /*endfinally*/];
                    case 31:
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
function initializeTimers(store, contextBuilder, timers) {
    var e_2, _a;
    var _this = this;
    if (process.env.OAK_PLATFORM === 'wechatMp') {
        var platform = wx.getSystemInfoSync().platform;
        if (platform !== 'devtools') {
            // 在真机调试环境下，timer中调用Intl会挂
            return;
        }
    }
    var _loop_1 = function (timer) {
        var cron = timer.cron, fn = timer.fn, name_1 = timer.name;
        (0, node_schedule_1.scheduleJob)(name_1, cron, function (date) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var start, context, result, err_2;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        start = Date.now();
                        return [4 /*yield*/, contextBuilder()(store)];
                    case 1:
                        context = _a.sent();
                        return [4 /*yield*/, context.begin()];
                    case 2:
                        _a.sent();
                        console.log("\u5B9A\u65F6\u5668\u3010".concat(name_1, "\u3011\u5F00\u59CB\u6267\u884C\uFF0C\u65F6\u95F4\u662F\u3010").concat(date.toLocaleTimeString(), "\u3011"));
                        _a.label = 3;
                    case 3:
                        _a.trys.push([3, 6, , 8]);
                        return [4 /*yield*/, fn(context)];
                    case 4:
                        result = _a.sent();
                        console.log("\u5B9A\u65F6\u5668\u3010".concat(name_1, "\u3011\u6267\u884C\u5B8C\u6210\uFF0C\u8017\u65F6").concat(Date.now() - start, "\u6BEB\u79D2\uFF0C\u7ED3\u679C\u662F\u3010").concat(result, "\u3011"));
                        return [4 /*yield*/, context.commit()];
                    case 5:
                        _a.sent();
                        return [3 /*break*/, 8];
                    case 6:
                        err_2 = _a.sent();
                        console.warn("\u5B9A\u65F6\u5668\u3010".concat(name_1, "\u3011\u6267\u884C\u5931\u8D25\uFF0C\u8017\u65F6").concat(Date.now() - start, "\u6BEB\u79D2\uFF0C\u9519\u8BEF\u662F"), err_2);
                        return [4 /*yield*/, context.rollback()];
                    case 7:
                        _a.sent();
                        return [3 /*break*/, 8];
                    case 8: return [2 /*return*/];
                }
            });
        }); });
    };
    try {
        for (var timers_1 = tslib_1.__values(timers), timers_1_1 = timers_1.next(); !timers_1_1.done; timers_1_1 = timers_1.next()) {
            var timer = timers_1_1.value;
            _loop_1(timer);
        }
    }
    catch (e_2_1) { e_2 = { error: e_2_1 }; }
    finally {
        try {
            if (timers_1_1 && !timers_1_1.done && (_a = timers_1.return)) _a.call(timers_1);
        }
        finally { if (e_2) throw e_2.error; }
    }
}
function doRoutines(store, contextBuilder, routines) {
    return tslib_1.__awaiter(this, void 0, void 0, function () {
        var routines_1, routines_1_1, routine, name_2, fn, context_1, start, result, err_3, e_3_1;
        var e_3, _a;
        return tslib_1.__generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 11, 12, 13]);
                    routines_1 = tslib_1.__values(routines), routines_1_1 = routines_1.next();
                    _b.label = 1;
                case 1:
                    if (!!routines_1_1.done) return [3 /*break*/, 10];
                    routine = routines_1_1.value;
                    name_2 = routine.name, fn = routine.fn;
                    return [4 /*yield*/, contextBuilder()(store)];
                case 2:
                    context_1 = _b.sent();
                    start = Date.now();
                    return [4 /*yield*/, context_1.begin()];
                case 3:
                    _b.sent();
                    _b.label = 4;
                case 4:
                    _b.trys.push([4, 7, , 9]);
                    return [4 /*yield*/, fn(context_1)];
                case 5:
                    result = _b.sent();
                    console.log("\u4F8B\u7A0B\u3010".concat(name_2, "\u3011\u6267\u884C\u5B8C\u6210\uFF0C\u8017\u65F6").concat(Date.now() - start, "\u6BEB\u79D2\uFF0C\u7ED3\u679C\u662F\u3010").concat(result, "\u3011"));
                    return [4 /*yield*/, context_1.commit()];
                case 6:
                    _b.sent();
                    return [3 /*break*/, 9];
                case 7:
                    err_3 = _b.sent();
                    console.warn("\u4F8B\u7A0B\u3010".concat(name_2, "\u3011\u6267\u884C\u5931\u8D25\uFF0C\u8017\u65F6").concat(Date.now() - start, "\u6BEB\u79D2\uFF0C\u9519\u8BEF\u662F"), err_3);
                    return [4 /*yield*/, context_1.rollback()];
                case 8:
                    _b.sent();
                    return [3 /*break*/, 9];
                case 9:
                    routines_1_1 = routines_1.next();
                    return [3 /*break*/, 1];
                case 10: return [3 /*break*/, 13];
                case 11:
                    e_3_1 = _b.sent();
                    e_3 = { error: e_3_1 };
                    return [3 /*break*/, 13];
                case 12:
                    try {
                        if (routines_1_1 && !routines_1_1.done && (_a = routines_1.return)) _a.call(routines_1);
                    }
                    finally { if (e_3) throw e_3.error; }
                    return [7 /*endfinally*/];
                case 13: return [2 /*return*/];
            }
        });
    });
}
function createDebugStore(storageSchema, contextBuilder, triggers, checkers, watchers, timers, startRoutines, initialData, actionDict, actionCascadePathGraph, relationCascadePathGraph, authDeduceRelationMap, saveFn, loadFn, selectFreeEntities, createFreeEntities, updateFreeEntities) {
    var store = new DebugStore_1.DebugStore(storageSchema, contextBuilder, actionCascadePathGraph, relationCascadePathGraph, authDeduceRelationMap, selectFreeEntities, createFreeEntities, updateFreeEntities);
    triggers.forEach(function (ele) { return store.registerTrigger(ele); });
    checkers.forEach(function (ele) { return store.registerChecker(ele); });
    (0, assert_1.assert)(actionDict);
    // 如果没有物化数据则使用initialData初始化debugStore
    var data = getMaterializedData(loadFn);
    if (!data) {
        initDataInStore(store, initialData);
        console.log('使用初始化数据建立debugStore', initialData);
    }
    else {
        // 对static的对象，使用initialData，剩下的使用物化数据
        for (var entity in initialData) {
            if (storageSchema[entity].static) {
                data.data[entity] = initialData[entity];
            }
        }
        initDataInStore(store, data.data, data.stat);
        console.log('使用物化数据建立debugStore', data);
    }
    lastMaterializedVersion = store.getStat().commit;
    // 当store中有更新事务提交时，物化store数据
    store.onCommit(function (result) {
        if (Object.keys(result).length > 0) {
            var stat = store.getStat();
            var data_1 = store.getCurrentData();
            materializeData(data_1, stat, saveFn);
        }
    });
    // 启动watcher
    initializeWatchers(store, contextBuilder, watchers);
    // 启动timer
    if (timers) {
        initializeTimers(store, contextBuilder, timers);
    }
    // 启动startRoutine
    if (startRoutines) {
        doRoutines(store, contextBuilder, startRoutines);
    }
    return store;
}
exports.createDebugStore = createDebugStore;
