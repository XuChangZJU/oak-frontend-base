"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDebugStore = void 0;
const node_schedule_1 = require("node-schedule");
const constant_1 = require("../constant/constant");
const DebugStore_1 = require("./DebugStore");
const assert_1 = require("oak-domain/lib/utils/assert");
const uuid_1 = require("oak-domain/lib/utils/uuid");
async function initDataInStore(store, initialData, stat) {
    store.resetInitialData(initialData, stat);
}
async function getMaterializedData(localStorage) {
    try {
        const data = await localStorage.load(constant_1.LOCAL_STORAGE_KEYS.debugStore);
        const stat = await localStorage.load(constant_1.LOCAL_STORAGE_KEYS.debugStoreStat);
        if (data && stat) {
            return {
                data,
                stat,
            };
        }
        return;
    }
    catch (e) {
        return;
    }
}
let lastMaterializedVersion = 0;
async function materializeData(data, stat, localStorage) {
    try {
        await localStorage.save(constant_1.LOCAL_STORAGE_KEYS.debugStore, data);
        await localStorage.save(constant_1.LOCAL_STORAGE_KEYS.debugStoreStat, stat);
        lastMaterializedVersion = stat.commit;
        console.log('物化数据', data);
    }
    catch (e) {
        console.error(e);
    }
}
async function execWatcher(store, watcher, context) {
    await context.begin();
    try {
        if (watcher.hasOwnProperty('actionData')) {
            const { entity, action, filter, actionData } = watcher;
            const filter2 = typeof filter === 'function' ? await filter() : filter;
            const data = typeof actionData === 'function' ? await actionData() : actionData; // 这里有个奇怪的编译错误，不理解 by Xc
            const result = await store.operate(entity, {
                id: await (0, uuid_1.generateNewIdAsync)(),
                action,
                data,
                filter: filter2
            }, context, {
                dontCollect: true,
            });
            await context.commit();
            return result;
        }
        else {
            const { entity, projection, fn, filter } = watcher;
            const filter2 = typeof filter === 'function' ? await filter() : filter;
            const projection2 = typeof projection === 'function' ? await projection() : projection;
            const rows = await store.select(entity, {
                data: projection2,
                filter: filter2,
            }, context, {
                dontCollect: true,
                blockTrigger: true,
            });
            let result = {};
            if (rows.length > 0) {
                result = await fn(context, rows);
            }
            await context.commit();
            return result;
        }
    }
    catch (err) {
        await context.rollback();
    }
}
/**
 * 在debug环境上创建watcher
 * @param store
 * @param watchers
 */
function initializeWatchers(store, contextBuilder, watchers) {
    let count = 0;
    async function doWatchers() {
        count++;
        const start = Date.now();
        const context = await contextBuilder()(store);
        for (const w of watchers) {
            try {
                const result = await execWatcher(store, w, context);
                console.log(`执行了watcher【${w.name}】成功，结果是：`, result);
            }
            catch (err) {
                console.error(`尝试执行watcher【${w.name}】，发生错误：`, err);
            }
        }
        const duration = Date.now() - start;
        console.log(`第${count}次执行watchers，共执行${watchers.length}个，耗时${duration}毫秒`);
        setTimeout(() => doWatchers(), 120000);
    }
    doWatchers();
}
function initializeTimers(store, contextBuilder, timers) {
    if (process.env.OAK_PLATFORM === 'wechatMp') {
        const { platform } = wx.getSystemInfoSync();
        if (platform !== 'devtools') {
            // 在真机调试环境下，timer中调用Intl会挂
            return;
        }
    }
    for (const timer of timers) {
        const { cron, name } = timer;
        (0, node_schedule_1.scheduleJob)(name, cron, async (date) => {
            const start = Date.now();
            const context = await contextBuilder()(store);
            console.log(`定时器【${name}】开始执行，时间是【${date.toLocaleTimeString()}】`);
            try {
                let result = {};
                if (timer.hasOwnProperty('entity')) {
                    result = (await execWatcher(store, timer, context));
                }
                else {
                    const { timer: timerFn } = timer;
                    result = await timerFn(context);
                }
                console.log(`定时器【${name}】执行完成，耗时${Date.now() - start}毫秒，结果是【${result}】`);
            }
            catch (err) {
                console.warn(`定时器【${name}】执行失败，耗时${Date.now() - start}毫秒，错误是`, err);
            }
        });
    }
}
async function doRoutines(store, contextBuilder, routines) {
    for (const routine of routines) {
        if (routine.hasOwnProperty('entity')) {
            const { name } = routine;
            const context = await contextBuilder()(store);
            const start = Date.now();
            try {
                const result = execWatcher(store, routine, context);
                console.log(`例程【${name}】执行完成，耗时${Date.now() - start}毫秒，结果是`, result);
            }
            catch (err) {
                console.warn(`例程【${name}】执行失败，耗时${Date.now() - start}毫秒，错误是`, err);
            }
        }
        else {
            const { name, routine: routineFn } = routine;
            const context = await contextBuilder()(store);
            const start = Date.now();
            await context.begin();
            try {
                const result = await routineFn(context);
                console.log(`例程【${name}】执行完成，耗时${Date.now() - start}毫秒，结果是`, result);
                await context.commit();
            }
            catch (err) {
                console.warn(`例程【${name}】执行失败，耗时${Date.now() - start}毫秒，错误是`, err);
                await context.rollback();
            }
        }
    }
}
function createDebugStore(storageSchema, contextBuilder, triggers, checkers, watchers, timers, startRoutines, initialData, actionDict, authDeduceRelationMap, localStorage, selectFreeEntities, updateFreeDict) {
    const store = new DebugStore_1.DebugStore(storageSchema, contextBuilder, authDeduceRelationMap, selectFreeEntities, updateFreeDict);
    triggers.forEach(ele => store.registerTrigger(ele));
    checkers.forEach(ele => store.registerChecker(ele));
    (0, assert_1.assert)(actionDict);
    // 如果没有物化数据则使用initialData初始化debugStore
    const loadInitialData = async () => {
        const data = await getMaterializedData(localStorage);
        if (!data) {
            initDataInStore(store, initialData);
            console.log('使用初始化数据建立debugStore', initialData);
        }
        else {
            // 对static的对象，使用initialData，剩下的使用物化数据
            for (const entity in initialData) {
                if (storageSchema[entity].static) {
                    data.data[entity] = initialData[entity];
                }
            }
            initDataInStore(store, data.data, data.stat);
            console.log('使用物化数据建立debugStore', data);
        }
    };
    loadInitialData();
    lastMaterializedVersion = store.getStat().commit;
    // 当store中有更新事务提交时，物化store数据
    store.onCommit(async (result) => {
        if (Object.keys(result).length > 0) {
            const stat = store.getStat();
            const data = store.getCurrentData();
            await materializeData(data, stat, localStorage);
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
