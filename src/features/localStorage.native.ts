import { unset } from 'oak-domain/lib/utils/lodash';
import { LOCAL_STORAGE_KEYS } from '../constant/constant';
import { Feature } from '../types/Feature';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

    async save(key: string, item: any) {
        this.setKey(key);
        await AsyncStorage.setItem(key, JSON.stringify(item));
    }

    async load(key: string) {
        this.setKey(key);
        const value = await AsyncStorage.getItem(key);
        if (value) {
            return JSON.parse(value);
        }
    }

    clear() {
        return AsyncStorage.clear();
    }

    remove(key: string) {
        return AsyncStorage.removeItem(key);
    }

    async loadAll() {
        const keys = await AsyncStorage.getAllKeys();
        const value = await AsyncStorage.multiGet(keys);
        const result: Record<string, any> = {};
        
        value.forEach(
            ([k, v]) => {
                if (typeof v === 'string') {
                    result[k] = JSON.parse(v);
                }
            }
        );
        return result;
    }

    resetAll(data: Record<string, any>) {
        const value = [] as [string, string][];
        Object.keys(data).forEach(
            (k) => {
                if (data[k] !== undefined && data[k] !== null) {
                    value.push(
                        [k, JSON.stringify(data[k])]
                    );
                }
            }
        )
        return AsyncStorage.multiMerge(value);
    }
}
