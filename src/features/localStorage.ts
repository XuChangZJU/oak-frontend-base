import { EntityDict, Context, AspectWrapper } from 'oak-domain/lib/types';
import { unset } from 'oak-domain/lib/utils/lodash';
import { Feature } from '../types/Feature';
import { CommonAspectDict } from 'oak-common-aspect';

export class LocalStorage<ED extends EntityDict, Cxt extends Context<ED>, AD extends CommonAspectDict<ED, Cxt>> extends Feature<ED, Cxt, AD> {
    keys: Record<string, boolean>;

    constructor(aspectWrapper: AspectWrapper<ED, Cxt, AD>) {
        super(aspectWrapper);
        this.keys = {};
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

    saveAll(data: Record<string, any>) {
        for (const k in data) {
            this.save(k, data[k]);
        }
    }
}
