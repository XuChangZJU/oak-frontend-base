import { unset } from 'oak-domain/lib/utils/lodash';
import { LOCAL_STORAGE_KEYS } from '../constant/constant';
import { Feature } from '../types/Feature';

export class LocalStorage  extends Feature {
    keys: Record<string, boolean>;

    constructor() {
        super();
        if (process.env.NODE_ENV === 'development') {
            // development环境下，debugStore的数据也默认存放在localStorage中
            this.keys = {
                [LOCAL_STORAGE_KEYS.debugStore]: true,
                [LOCAL_STORAGE_KEYS.debugStoreStat]: true,
            };
        }
        else {
            this.keys = {};
        }
    }

    setKey(key: string) {
        if (!this.keys[key]) {
            this.keys[key] = true;
        }
    }

    unsetKey(key: string) {
        if (this.keys[key]) {
            unset(this.keys, key);
        }
    }

    save(key: string, item: any) {
        this.setKey(key);
        switch (process.env.OAK_PLATFORM) {
            case 'wechatMp': {
                wx.setStorageSync(key, item);
                break;
            }
            case 'web': {
                localStorage.setItem(key, JSON.stringify(item));
                break;
            }
            default: {
                throw new Error('尚未支持');
            }
        }
    }

    load(key: string) {
        this.setKey(key);
        switch (process.env.OAK_PLATFORM) {
            case 'wechatMp': {
                return wx.getStorageSync(key);
            }
            case 'web': {
                const data = localStorage.getItem(key);
                if (data) {
                    return JSON.parse(data);
                }
                return undefined;                
            }
            default: {
                throw new Error('尚未支持');
            }
        }
    }

    clear() {
        this.keys = {};
        switch (process.env.OAK_PLATFORM) {
            case 'wechatMp': {
                wx.clearStorageSync();
                break;
            }
            case 'web': {
                localStorage.clear();
                break;
            }
            default: {
                throw new Error('尚未支持');
            }
        }
    }

    remove(key: string) {
        this.unsetKey(key);
        switch (process.env.OAK_PLATFORM) {
            case 'wechatMp': {
                wx.removeStorageSync(key);
                break;
            }
            case 'web': {
                localStorage.removeItem(key);
                break;
            }
            default: {
                throw new Error('尚未支持');
            }
        }
    }

    loadAll() {
        const data: Record<string, any> = {};
        for (const k in this.keys) {
            Object.assign(data, {
                [k]: this.load(k),
            });
        }

        return data;
    }

    resetAll(data: Record<string, any>) {
        this.clear();
        for (const k in data) {
            this.save(k, data[k]);
        }
    }
}
