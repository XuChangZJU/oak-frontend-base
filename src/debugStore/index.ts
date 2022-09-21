import { LOCAL_STORAGE_KEYS } from '../constant/constant';
import { DebugStore } from './DebugStore';
import {
    Checker, Trigger, StorageSchema, FormCreateData, Context, EntityDict, RowStore,
    ActionDictOfEntityDict, Watcher, BBWatcher, WBWatcher, OperationResult
} from "oak-domain/lib/types";
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
import { analyzeActionDefDict } from 'oak-domain/lib/store/actionDef';
import { makeIntrinsicWatchers } from 'oak-domain/lib/store/watchers';
import { assert } from 'oak-domain/lib/utils/assert';

async function initDataInStore<ED extends EntityDict & BaseEntityDict, Cxt extends Context<ED>>(
    store: DebugStore<ED, Cxt>,
    initialData: {
        [T in keyof ED]?: Array<ED[T]['OpSchema']>;
    }, stat?: {
        create: number;
        update: number;
        remove: number;
        commit: number;
    }) {
    store.startInitializing();
    store.resetInitialData(initialData, stat);
    store.endInitializing();
}

function getMaterializedData() {
    if (process.env.OAK_PLATFORM === 'wechatMp') {
        try {
            const data = wx.getStorageSync(LOCAL_STORAGE_KEYS.debugStore);
            const stat = wx.getStorageSync(LOCAL_STORAGE_KEYS.debugStoreStat);
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
    } else if (process.env.OAK_PLATFORM === 'web') {
        try {
            const data = JSON.parse(
                window.localStorage.getItem(LOCAL_STORAGE_KEYS.debugStore) as string
            );
            const stat = JSON.parse(
                window.localStorage.getItem(LOCAL_STORAGE_KEYS.debugStoreStat) as string
            );
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
}

let lastMaterializedVersion = 0;

function materializeData(data: any, stat: { create: number, update: number, remove: number, commit: number }) {
    if (process.env.OAK_PLATFORM === 'wechatMp') {
        try {
            wx.setStorageSync(LOCAL_STORAGE_KEYS.debugStore, data);
            wx.setStorageSync(LOCAL_STORAGE_KEYS.debugStoreStat, stat);
            lastMaterializedVersion = stat.commit;
            wx.showToast({
                title: '数据已物化',
                icon: 'success',
            });
            console.log('物化数据', data);
        } catch (e) {
            console.error(e);
            wx.showToast({
                title: '物化数据失败',
                icon: 'error',
            });
        }
    }
     else if (process.env.OAK_PLATFORM === 'web') {
        try {
            window.localStorage.setItem(
                LOCAL_STORAGE_KEYS.debugStore,
                typeof data === 'string' ? data : JSON.stringify(data)
            );
            window.localStorage.setItem(LOCAL_STORAGE_KEYS.debugStoreStat, JSON.stringify(stat));
            lastMaterializedVersion = stat.commit;
            console.log('物化数据', data);
            // alert('数据已物化');
        } catch (e) {
            console.error(e);
            // alert('物化数据失败');
        }
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
function initializeWatchers<ED extends EntityDict & BaseEntityDict, Cxt extends Context<ED>>(
    store: DebugStore<ED, Cxt>, contextBuilder: (cxtString?: string) => (store: RowStore<ED, Cxt>) =>  Promise<Cxt>, watchers: Array<Watcher<ED, keyof ED, Cxt>>) {
    
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
                    const filter2 = typeof filter === 'function' ? await filter() : filter;
                    const data = typeof actionData === 'function' ? await (actionData as any)() : actionData;        // 这里有个奇怪的编译错误，不理解 by Xc
                    const result = await store.operate(entity, {
                        id: await generateNewId(),
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
                    const filter2 = typeof filter === 'function' ? await filter() : filter;
                    const projection2 = typeof projection === 'function' ? await projection() : projection;
                    const { result: rows } = await store.select(entity, {
                        data: projection2 as any,
                        filter: filter2,
                    }, context, {
                        dontCollect: true,
                    });

                    const result = fn(context, rows);
                    console.log(`执行了watcher【${w.name}】，结果是：`, result);
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

export function createDebugStore<ED extends EntityDict & BaseEntityDict, Cxt extends Context<ED>>(
    storageSchema: StorageSchema<ED>,
    contextBuilder: (cxtString?: string) => (store: RowStore<ED, Cxt>) => Promise<Cxt>,
    triggers: Array<Trigger<ED, keyof ED, Cxt>>,
    checkers: Array<Checker<ED, keyof ED, Cxt>>,
    watchers: Array<Watcher<ED, keyof ED, Cxt>>,
    initialData?: {
        [T in keyof ED]?: Array<ED[T]['OpSchema']>;
    },
    actionDict?: ActionDictOfEntityDict<ED>) {
    const store = new DebugStore<ED, Cxt>(storageSchema, contextBuilder);

    triggers.forEach(
        ele => store.registerTrigger(ele)
    );

    checkers.forEach(
        ele => store.registerChecker(ele)
    );

    assert(actionDict);
    const { triggers: adTriggers, checkers: adCheckers, watchers: adWatchers } = analyzeActionDefDict(storageSchema, actionDict!);
    adTriggers.forEach(
        ele => store.registerTrigger(ele)
    );
    adCheckers.forEach(
        ele => store.registerChecker(ele)
    );

    // 如果没有物化数据则使用initialData初始化debugStore
    const data = getMaterializedData();
    if (!data) {
        initDataInStore(store, initialData!);
        console.log('使用初始化数据建立debugStore', initialData);
    }
    else {
        initDataInStore(store, data.data, data.stat);
        console.log('使用物化数据建立debugStore', data);
    }
    lastMaterializedVersion = store.getStat().commit;

    // 启动定期的物化例程
    setInterval(() => {
        const stat = store.getStat();
        if (stat.commit === lastMaterializedVersion) {
            return;
        }
        const data = store.getCurrentData();
        materializeData(data, stat);
    }, 10000);

    // 启动watcher
    initializeWatchers(store, contextBuilder, watchers.concat(adWatchers));
    return store;
}

