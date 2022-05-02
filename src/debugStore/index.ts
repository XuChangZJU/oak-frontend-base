import { DebugStore } from './debugStore';
import { Checker, Trigger, StorageSchema, FormCreateData, Context, EntityDict, RowStore, ActionDictOfEntityDict } from "oak-domain/lib/types";
import { analyzeActionDefDict } from 'oak-domain/lib/store/actionDef';

async function initDataInStore<ED extends EntityDict, Cxt extends Context<ED>>(store: DebugStore<ED, Cxt>, createContext: (store: RowStore<ED, Cxt>) => Cxt, initialData?: {
    [T in keyof ED]?: Array<FormCreateData<ED[T]['OpSchema']>>;
}) {
    store.startInitializing();
    if (false) {
        // todo 在不同环境下读取相应的store数据并初始化
    }
    else {
        const context = createContext(store);
        await context.begin();
        if (initialData) {
            for (const entity in initialData) {
                await store.operate(entity, {
                    action: 'create',
                    data: initialData[entity]!,
                }, context, { noLock: true });
            }
        }
        await context.commit();
    }
    store.endInitalizing();
}

function getMaterializedData() {
    if (/* process.env.OAK_PLATFORM === 'weChatMp' */true) {
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

function materializeData(data: any, stat: { create: number, update: number, remove: number, commit: number }) {
    if (/* process.env.OAK_PLATFORM === 'weChatMp' */true) {
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

export function createDebugStore<ED extends EntityDict, Cxt extends Context<ED>>(
    storageSchema: StorageSchema<ED>,
    createContext: (store: RowStore<ED, Cxt>) => Cxt,
    triggers?: Array<Trigger<ED, keyof ED, Cxt>>,
    checkers?: Array<Checker<ED, keyof ED, Cxt>>,
    initialData?: {
        [T in keyof ED]?: Array<FormCreateData<ED[T]['OpSchema']>>;
    },
    actionDict?: ActionDictOfEntityDict<ED>) {
    const data = getMaterializedData();
    const store = new DebugStore<ED, Cxt>(storageSchema, createContext, data && data.data, data && data.stat);

    triggers?.forEach(
        ele => store.registerTrigger(ele)
    );

    checkers?.forEach(
        ele => store.registerChecker(ele)
    );

    if (actionDict) {
        const { triggers: adTriggers, checkers: adCheckers } = analyzeActionDefDict(storageSchema, actionDict);
        adTriggers.forEach(
            ele => store.registerTrigger(ele)
        );
        adCheckers.forEach(
            ele => store.registerChecker(ele)            
        );
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

