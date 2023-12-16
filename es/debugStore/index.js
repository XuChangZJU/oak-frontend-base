import { scheduleJob } from 'node-schedule';
import { LOCAL_STORAGE_KEYS } from '../constant/constant';
import { DebugStore } from './DebugStore';
import { assert } from 'oak-domain/lib/utils/assert';
import { generateNewIdAsync } from 'oak-domain/lib/utils/uuid';
async function initDataInStore(store, initialData, stat) {
    store.resetInitialData(initialData, stat);
}
async function getMaterializedData(loadFn) {
    try {
        const data = await loadFn(LOCAL_STORAGE_KEYS.debugStore);
        const stat = await loadFn(LOCAL_STORAGE_KEYS.debugStoreStat);
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
async function materializeData(data, stat, saveFn) {
    try {
        await saveFn(LOCAL_STORAGE_KEYS.debugStore, data);
        await saveFn(LOCAL_STORAGE_KEYS.debugStoreStat, stat);
        lastMaterializedVersion = stat.commit;
        console.log('物化数据', data);
    }
    catch (e) {
        console.error(e);
    }
}
export function clearMaterializedData() {
    if (process.env.OAK_PLATFORM === 'wechatMp') {
        try {
            wx.removeStorageSync(LOCAL_STORAGE_KEYS.debugStore);
            wx.removeStorageSync(LOCAL_STORAGE_KEYS.debugStoreStat);
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
            window.localStorage.removeItem(LOCAL_STORAGE_KEYS.debugStore);
            window.localStorage.removeItem(LOCAL_STORAGE_KEYS.debugStoreStat);
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
async function execWatcher(store, watcher, context) {
    await context.begin();
    try {
        if (watcher.hasOwnProperty('actionData')) {
            const { entity, action, filter, actionData } = watcher;
            const filter2 = typeof filter === 'function' ? await filter() : filter;
            const data = typeof actionData === 'function' ? await actionData() : actionData; // 这里有个奇怪的编译错误，不理解 by Xc
            const result = await store.operate(entity, {
                id: await generateNewIdAsync(),
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
        scheduleJob(name, cron, async (date) => {
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
export function createDebugStore(storageSchema, contextBuilder, triggers, checkers, watchers, timers, startRoutines, initialData, actionDict, authDeduceRelationMap, saveFn, loadFn, selectFreeEntities, updateFreeDict) {
    const store = new DebugStore(storageSchema, contextBuilder, authDeduceRelationMap, selectFreeEntities, updateFreeDict);
    triggers.forEach(ele => store.registerTrigger(ele));
    checkers.forEach(ele => store.registerChecker(ele));
    assert(actionDict);
    // 如果没有物化数据则使用initialData初始化debugStore
    const loadInitialData = async () => {
        const data = await getMaterializedData(loadFn);
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
            await materializeData(data, stat, saveFn);
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
