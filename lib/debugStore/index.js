"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDebugStore = void 0;
const debugStore_1 = require("./debugStore");
const actionDef_1 = require("oak-domain/lib/store/actionDef");
async function initDataInStore(store, createContext, initialData) {
    store.startInitializing();
    if (false) {
        // todo 在不同环境下读取相应的store数据并初始化
    }
    else {
        const context = createContext(store, 'initDataInStore');
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
    store.endInitalizing();
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
function createDebugStore(storageSchema, createContext, triggers, checkers, initialData, actionDict) {
    const data = getMaterializedData();
    const store = new debugStore_1.DebugStore(storageSchema, createContext, data && data.data, data && data.stat);
    triggers?.forEach(ele => store.registerTrigger(ele));
    checkers?.forEach(ele => store.registerChecker(ele));
    if (actionDict) {
        const { triggers: adTriggers, checkers: adCheckers } = (0, actionDef_1.analyzeActionDefDict)(storageSchema, actionDict);
        adTriggers.forEach(ele => store.registerTrigger(ele));
        adCheckers.forEach(ele => store.registerChecker(ele));
    }
    // 如果没有物化数据则使用initialData初始化debugStore
    if (!data) {
        console.log('使用初始化数据建立debugStore');
        initDataInStore(store, createContext, initialData);
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
    return store;
}
exports.createDebugStore = createDebugStore;
