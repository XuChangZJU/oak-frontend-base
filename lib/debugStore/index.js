"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDebugStore = void 0;
const debugStore_1 = require("./debugStore");
const actionDef_1 = require("oak-domain/lib/store/actionDef");
const watchers_1 = require("oak-domain/lib/store/watchers");
async function initDataInStore(store, contextBuilder, initialData) {
    store.startInitializing();
    if (false) {
        // todo 在不同环境下读取相应的store数据并初始化
    }
    else {
        const context = contextBuilder()(store);
        await context.begin();
        if (initialData) {
            for (const entity in initialData) {
                await store.operate(entity, {
                    action: 'create',
                    data: initialData[entity],
                }, context, { noLock: true });
            }
        }
        await context.commit();
    }
    store.endInitializing();
}
function getMaterializedData() {
    if ( /* process.env.OAK_PLATFORM === 'weChatMp' */true) {
        try {
            const data = wx.getStorageSync('debugStore');
            const stat = wx.getStorageSync('debugStoreStat');
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
}
let lastMaterializedVersion = 0;
function materializeData(data, stat) {
    if ( /* process.env.OAK_PLATFORM === 'weChatMp' */true) {
        try {
            wx.setStorageSync('debugStore', data);
            wx.setStorageSync('debugStoreStat', stat);
            lastMaterializedVersion = stat.commit;
            wx.showToast({
                title: '数据已物化',
                icon: 'success',
            });
        }
        catch (e) {
            console.error(e);
            wx.showToast({
                title: '物化数据失败',
                icon: 'error',
            });
        }
    }
}
/**
 * 在debug环境上创建watcher
 * @param store
 * @param watchers
 */
function initializeWatchers(store, contextBuilder, watchers) {
    const schema = store.getSchema();
    const intrinsicWatchers = (0, watchers_1.makeIntrinsicWatchers)(schema);
    const totalWatchers = watchers.concat(intrinsicWatchers);
    let count = 0;
    async function doWatchers() {
        count++;
        const start = Date.now();
        const context = contextBuilder()(store);
        for (const w of totalWatchers) {
            await context.begin();
            try {
                if (w.hasOwnProperty('actionData')) {
                    const { entity, action, filter, actionData } = w;
                    const filter2 = typeof filter === 'function' ? await filter() : filter;
                    const data = typeof actionData === 'function' ? await actionData() : actionData; // 这里有个奇怪的编译错误，不理解 by Xc
                    const result = await store.operate(entity, {
                        action,
                        data,
                        filter: filter2
                    }, context);
                    console.log(`执行了watcher【${w.name}】，结果是：`, result);
                }
                else {
                    const { entity, projection, fn, filter } = w;
                    const filter2 = typeof filter === 'function' ? await filter() : filter;
                    const projection2 = typeof projection === 'function' ? await projection() : projection;
                    const { result: rows } = await store.select(entity, {
                        data: projection2,
                        filter: filter2,
                    }, context);
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
        console.log(`第${count}次执行watchers，共执行${totalWatchers.length}个，耗时${duration}毫秒`);
        setTimeout(() => doWatchers(), 120000);
    }
    doWatchers();
}
function createDebugStore(storageSchema, contextBuilder, triggers, checkers, watchers, initialData, actionDict) {
    const data = getMaterializedData();
    const store = new debugStore_1.DebugStore(storageSchema, contextBuilder, data && data.data, data && data.stat);
    triggers.forEach(ele => store.registerTrigger(ele));
    checkers.forEach(ele => store.registerChecker(ele));
    if (actionDict) {
        const { triggers: adTriggers, checkers: adCheckers } = (0, actionDef_1.analyzeActionDefDict)(storageSchema, actionDict);
        adTriggers.forEach(ele => store.registerTrigger(ele));
        adCheckers.forEach(ele => store.registerChecker(ele));
    }
    // 如果没有物化数据则使用initialData初始化debugStore
    if (!data) {
        console.log('使用初始化数据建立debugStore');
        initDataInStore(store, contextBuilder, initialData);
    }
    else {
        console.log('使用物化数据建立debugStore');
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
    initializeWatchers(store, contextBuilder, watchers);
    return store;
}
exports.createDebugStore = createDebugStore;
