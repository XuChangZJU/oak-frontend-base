import { EntityDict, Aspect, Context, AspectWrapper } from 'oak-domain/lib/types';
import { Feature } from '../types/Feature';
import { CommonAspectDict } from 'oak-common-aspect';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
import { AsyncContext } from 'oak-domain/lib/store/AsyncRowStore';
import { Cache } from './cache';
import { LocalStorage } from './localStorage';
import { Environment } from './environment';
import { SyncContext } from 'oak-domain/lib/store/SyncRowStore';
import assert from 'assert';
import { I18n, Scope, TranslateOptions } from 'i18n-js';
import { uniq } from 'oak-domain/lib/utils/lodash';

import { LOCAL_STORAGE_KEYS } from '../constant/constant';

export class Locales<ED extends EntityDict & BaseEntityDict, Cxt extends AsyncContext<ED>, FrontCxt extends SyncContext<ED>, AD extends CommonAspectDict<ED, Cxt>> extends Feature {
    static MINIMAL_LOADING_GAP = 600 * 10000;       // 最小加载间歇
    private cache: Cache<ED, Cxt, FrontCxt, AD>;
    private localStorage: LocalStorage;
    private environment: Environment;
    private makeBridgeUrlFn?: (url: string, headers?: Record<string, string>) => string
    private language: string;
    private defaultLng: string;
    private i18n: I18n;

    constructor(
        cache: Cache<ED, Cxt, FrontCxt, AD>,
        localStorage: LocalStorage,
        environment: Environment,
        defaultLng: string,
        makeBridgeUrlFn?: (url: string, headers?: Record<string, string>) => string
    ) {
        super();
        this.cache = cache;
        this.localStorage = localStorage;
        this.defaultLng = defaultLng;
        this.environment = environment;
        const savedLng = localStorage.load(LOCAL_STORAGE_KEYS.localeLng);
        if (savedLng) {
            this.language = savedLng;
        }
        else {
            this.language = defaultLng;
            this.detectLanguange();
        }
        this.i18n = new I18n(undefined, {
            defaultLocale: defaultLng,
            locale: this.language,
        });
        this.resetDataset();

        // i18n miss的默认策略
        this.i18n.missingBehavior = 'loadData';
        this.i18n.missingTranslation.register("loadData", (i18n, scope, options) => {
            this.loadData(scope);
            assert(typeof scope === 'string');
            return scope.split('.').pop()!;
        });
        // 同时注册一个返回空字符串的策略
        this.i18n.missingTranslation.register("returnNull", (i18n, scope, options) => {
            return '';
        });

        this.makeBridgeUrlFn = makeBridgeUrlFn;
    }

    private async detectLanguange() {
        const env = await this.environment.getEnv();
        const { language } = env;
        this.language = language;
        this.localStorage.save(LOCAL_STORAGE_KEYS.localeLng, language);
    }

    private resetDataset() {
        const i18ns = this.cache.get('i18n', {
            data: {
                id: 1,
                data: 1,
                namespace: 1,
                language: 1,
            },
        });
        const dataset: Record<string, any> = {};
        i18ns.forEach(
            ({ namespace, data, language }) => {
                if (dataset[language!]) {
                    dataset[language!]![namespace!] = data as Record<string, any>;
                }
                else {
                    dataset[language!] = {
                        [namespace!]: data,
                    };
                }
            }
        );
        this.i18n.store(dataset);
    }

    /**
     * 当发生key缺失时，向服务器请求最新的i18n数据，对i18n缓存数据的行为优化放在cache中统一进行
     * @param ns 
     */
    private async loadData(key: Scope) {
        assert(typeof key === 'string');
        const [ ns ] = key.split('.');

        const { data: newI18ns } = await this.cache.refresh('i18n', {
            data: {
                id: 1,
                data: 1,
                namespace: 1,
                language: 1,
                $$createAt$$: 1,
                $$updateAt$$: 1,
            },
            filter: {
                namespace: ns,
            }
        }, undefined, undefined, undefined, true);

        if (newI18ns.length > 0) {
            const dataset: Record<string, any> = {};
            newI18ns.forEach(
                ({ namespace, data, language }) => {
                    if (dataset[language!]) {
                        dataset[language!][namespace!] = data;
                    }
                    else {
                        dataset[language!] = {
                            [namespace!]: data,
                        };
                    }
                }
            );
            this.i18n.store(dataset);
            this.publish();
        }
        else {
            console.warn(`命名空间${ns}中的${key}缺失且请求不到更新的数据，请检查`);
        }
    }

    /**
     * 暴露给小程序的Wxs调用
     * @param key 
     */
    loadMissedLocale(key: string) {
        this.loadData(key);
    }

    /**
     * translate函数，这里编译器会在params里注入两个参数 #oakNamespace 和 #oakModule，用以标识文件路径
     * @param key 
     * @param params 
     * @returns 
     */
    t(key: string, params?: TranslateOptions) {
        // return key as string;
        const ns = params!['#oakNamespace'];
        const module = params!['#oakModule'];

        let key2 = key;
        if (key.includes('::')) {
            // 公共模块
            key2 = `${module}-l-${key}`.replace('::', '.');
        }
        else if (key.includes(':')) {
            // entity
            key2 = key.replace(':', '.');
        }
        else {
            // 自身模块
            key2 = `${ns}.${key}`;
        }

        return this.i18n.t(key2, params);
    }

    // 获得当前locales的状态，小程序需要dataset去Wxs里渲染，同时reRender也要利用version触发render
    getState() {
        return {
            lng: this.language,
            defaultLng: this.defaultLng,
            dataset: this.i18n.translations,
            version: this.i18n.version,
        };
    }

    // 查看有无某值，不触发获取数据
    hasKey(key: Scope, params?: TranslateOptions) {
        this.i18n.missingBehavior = 'returnNull';
        const result = this.i18n.t(key, params);
        this.i18n.missingBehavior = 'loadData';
        return result;
    }

    // 这个是临时的代码（和locales没有关系），等和auth线合并了再移到合适的feature里去
    makeBridgeUrl(url: string, headers?: Record<string, string>) {
        if (this.makeBridgeUrlFn) {
            return this.makeBridgeUrlFn(url, headers);
        }

        console.warn('development模式下无法使用bridge，直接使用原始url', url);
        return url;
    }
}
