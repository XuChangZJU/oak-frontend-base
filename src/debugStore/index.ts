import { scheduleJob } from 'node-schedule';
import { LOCAL_STORAGE_KEYS } from '../constant/constant';
import { DebugStore } from './DebugStore';
import {
    Checker, Trigger, StorageSchema, EntityDict, ActionDictOfEntityDict, Watcher, BBWatcher, WBWatcher, Routine, Timer, AuthCascadePath, AuthDeduceRelationMap
} from "oak-domain/lib/types";
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';

import { assert } from 'oak-domain/lib/utils/assert';
import { AsyncContext } from 'oak-domain/lib/store/AsyncRowStore';
import { generateNewIdAsync } from 'oak-domain/lib/utils/uuid';

async function initDataInStore<ED extends EntityDict & BaseEntityDict, Cxt extends AsyncContext<ED>>(
    store: DebugStore<ED, Cxt>,
    initialData: {
        [T in keyof ED]?: Array<ED[T]['OpSchema']>;
    }, stat?: {
        create: number;
        update: number;
        remove: number;
        commit: number;
    }) {
    store.resetInitialData(initialData, stat);
}

function getMaterializedData(loadFn: (key: string) => any) {
    try {
        const data = loadFn(LOCAL_STORAGE_KEYS.debugStore);
        const stat = loadFn(LOCAL_STORAGE_KEYS.debugStoreStat);
        if (data && stat) {
            return {
                data,
                stat,
            };
        }
        return;
    } catch (e) {
        return;
    }
}

let lastMaterializedVersion = 0;

function materializeData(
    data: any,
    stat: { create: number, update: number, remove: number, commit: number },
    saveFn: (key: string, data: any) => void) {
    try {
        saveFn(LOCAL_STORAGE_KEYS.debugStore, data);
        saveFn(LOCAL_STORAGE_KEYS.debugStoreStat, stat);
        lastMaterializedVersion = stat.commit;
        console.log('物化数据', data);
    } catch (e) {
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
        } catch (e) {
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
        } catch (e) {
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
function initializeWatchers<ED extends EntityDict & BaseEntityDict, Cxt extends AsyncContext<ED>>(
    store: DebugStore<ED, Cxt>, contextBuilder: (cxtString?: string) => (store: DebugStore<ED, Cxt>) => Promise<Cxt>, watchers: Array<Watcher<ED, keyof ED, Cxt>>) {

    let count = 0;
    async function doWatchers() {
        count++;
        const start = Date.now();
        const context = await contextBuilder()(store);
        for (const w of watchers) {
            await context.begin();
            try {
                if (w.hasOwnProperty('actionData')) {
                    const { entity, action, filter, actionData } = <BBWatcher<ED, keyof ED>>w;
                    const filter2 = typeof filter === 'function' ? await (filter as Function)() : filter;
                    const data = typeof actionData === 'function' ? await (actionData as Function)() : actionData;        // 这里有个奇怪的编译错误，不理解 by Xc
                    const result = await store.operate(entity, {
                        id: await generateNewIdAsync(),
                        action,
                        data,
                        filter: filter2
                    }, context, {
                        dontCollect: true,
                    });

                    console.log(`执行了watcher【${w.name}】，结果是：`, result);
                }
                else {
                    const { entity, projection, fn, filter } = <WBWatcher<ED, keyof ED, Cxt>>w;
                    const filter2 = typeof filter === 'function' ? await (filter as Function)() : filter;
                    const projection2 = typeof projection === 'function' ? await (projection as Function)() : projection;
                    const rows = await store.select(entity, {
                        data: projection2 as any,
                        filter: filter2,
                    }, context, {
                        dontCollect: true,
                        blockTrigger: true,
                    });

                    if (rows.length > 0) {
                        const result = await fn(context, rows);
                        console.log(`执行了watcher【${w.name}】，结果是：`, result);
                    }
                }
                await context.commit();
            }
            catch (err) {
                await context.rollback();
                console.error(`执行了watcher【${w.name}】，发生错误：`, err);
            }
        }
        const duration = Date.now() - start;
        console.log(`第${count}次执行watchers，共执行${watchers.length}个，耗时${duration}毫秒`);

        setTimeout(() => doWatchers(), 120000);
    }

    doWatchers();
}

function initializeTimers<ED extends EntityDict & BaseEntityDict, Cxt extends AsyncContext<ED>>(
    store: DebugStore<ED, Cxt>, contextBuilder: (cxtString?: string) => (store: DebugStore<ED, Cxt>) => Promise<Cxt>, timers: Array<Timer<ED, Cxt>>
) {
    if (process.env.OAK_PLATFORM === 'wechatMp') {
        const { platform } = wx.getSystemInfoSync();
        if (platform !== 'devtools') {
            // 在真机调试环境下，timer中调用Intl会挂
            return;
        }
    }
    for (const timer of timers) {
        const { cron, fn, name } = timer;
        scheduleJob(name, cron, async (date) => {
            const start = Date.now();
            const context = await contextBuilder()(store);
            await context.begin();
            console.log(`定时器【${name}】开始执行，时间是【${date.toLocaleTimeString()}】`);
            try {
                const result = await fn(context);
                console.log(`定时器【${name}】执行完成，耗时${Date.now() - start}毫秒，结果是【${result}】`);
                await context.commit();
            }
            catch (err) {
                console.warn(`定时器【${name}】执行失败，耗时${Date.now() - start}毫秒，错误是`, err);
                await context.rollback();
            }
        })
    }
}

async function doRoutines<ED extends EntityDict & BaseEntityDict, Cxt extends AsyncContext<ED>>(
    store: DebugStore<ED, Cxt>, contextBuilder: (cxtString?: string) => (store: DebugStore<ED, Cxt>) => Promise<Cxt>, routines: Array<Routine<ED, Cxt>>
) {
    for (const routine of routines) {
        const { name, fn } = routine;
        const context = await contextBuilder()(store);
        const start = Date.now();
        await context.begin();
        try {
            const result = await fn(context);
            console.log(`例程【${name}】执行完成，耗时${Date.now() - start}毫秒，结果是【${result}】`);
            await context.commit();
        }
        catch (err) {
            console.warn(`例程【${name}】执行失败，耗时${Date.now() - start}毫秒，错误是`, err);
            await context.rollback();
        }
    }
}

export function createDebugStore<ED extends EntityDict & BaseEntityDict, Cxt extends AsyncContext<ED>>(
    storageSchema: StorageSchema<ED>,
    contextBuilder: (cxtString?: string) => (store: DebugStore<ED, Cxt>) => Promise<Cxt>,
    triggers: Array<Trigger<ED, keyof ED, Cxt>>,
    checkers: Array<Checker<ED, keyof ED, Cxt>>,
    watchers: Array<Watcher<ED, keyof ED, Cxt>>,
    timers: Array<Timer<ED, Cxt>>,
    startRoutines: Array<Routine<ED, Cxt>>,
    initialData: {
        [T in keyof ED]?: Array<ED[T]['OpSchema']>;
    },
    actionDict: ActionDictOfEntityDict<ED>,
    actionCascadePathGraph: AuthCascadePath<ED>[],
    relationCascadePathGraph: AuthCascadePath<ED>[],
    authDeduceRelationMap: AuthDeduceRelationMap<ED>,
    saveFn: (key: string, data: any) => void,
    loadFn: (key: string) => any,
    selectFreeEntities?: (keyof ED)[],
    createFreeEntities?: (keyof ED)[],
    updateFreeEntities?: (keyof ED)[],) {
    const store = new DebugStore<ED, Cxt>(storageSchema, contextBuilder, actionCascadePathGraph, relationCascadePathGraph, authDeduceRelationMap,
        selectFreeEntities, createFreeEntities, updateFreeEntities);

    triggers.forEach(
        ele => store.registerTrigger(ele)
    );

    checkers.forEach(
        ele => store.registerChecker(ele)
    );

    assert(actionDict);

    // 如果没有物化数据则使用initialData初始化debugStore
    const data = getMaterializedData(loadFn);
    if (!data) {
        initDataInStore(store, initialData!);
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
    lastMaterializedVersion = store.getStat().commit;

    // 当store中有更新事务提交时，物化store数据
    store.onCommit((result) => {
        if (Object.keys(result).length > 0) {
            const stat = store.getStat();
            const data = store.getCurrentData();
            materializeData(data, stat, saveFn);
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

