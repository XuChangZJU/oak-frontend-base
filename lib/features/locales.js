"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Locales = void 0;
const Feature_1 = require("../types/Feature");
const assert_1 = require("oak-domain/lib/utils/assert");
const i18n_js_1 = require("i18n-js");
const constant_1 = require("../constant/constant");
class Locales extends Feature_1.Feature {
    static MINIMAL_LOADING_GAP = 600 * 10000; // 最小加载间歇
    cache;
    localStorage;
    environment;
    makeBridgeUrlFn;
    language;
    defaultLng;
    i18n;
    constructor(cache, localStorage, environment, defaultLng, makeBridgeUrlFn) {
        super();
        this.cache = cache;
        this.localStorage = localStorage;
        this.defaultLng = defaultLng;
        this.environment = environment;
        const savedLng = localStorage.load(constant_1.LOCAL_STORAGE_KEYS.localeLng);
        if (savedLng) {
            this.language = savedLng;
        }
        else {
            this.language = defaultLng;
            this.detectLanguange();
        }
        this.i18n = new i18n_js_1.I18n(undefined, {
            defaultLocale: defaultLng,
            locale: this.language,
        });
        this.resetDataset();
        // i18n miss的默认策略
        this.i18n.missingBehavior = 'loadData';
        this.i18n.missingTranslation.register("loadData", (i18n, scope, options) => {
            this.loadData(scope);
            (0, assert_1.assert)(typeof scope === 'string');
            return scope.split('.').pop();
        });
        // 同时注册一个返回空字符串的策略
        this.i18n.missingTranslation.register("returnNull", (i18n, scope, options) => {
            return '';
        });
        this.makeBridgeUrlFn = makeBridgeUrlFn;
    }
    async detectLanguange() {
        const env = await this.environment.getEnv();
        const { language } = env;
        this.language = language;
        this.localStorage.save(constant_1.LOCAL_STORAGE_KEYS.localeLng, language);
    }
    resetDataset() {
        const i18ns = this.cache.get('i18n', {
            data: {
                id: 1,
                data: 1,
                namespace: 1,
                language: 1,
            },
        });
        const dataset = {};
        i18ns.forEach(({ namespace, data, language }) => {
            if (dataset[language]) {
                dataset[language][namespace] = data;
            }
            else {
                dataset[language] = {
                    [namespace]: data,
                };
            }
        });
        this.i18n.store(dataset);
    }
    /**
     * 当发生key缺失时，向服务器请求最新的i18n数据，对i18n缓存数据的行为优化放在cache中统一进行
     * @param ns
     */
    async loadData(key) {
        (0, assert_1.assert)(typeof key === 'string');
        const [ns] = key.split('.');
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
        }, undefined, undefined, undefined, {
            dontPublish: true,
            useLocalCache: {
                keys: [ns],
                gap: process.env.NODE_ENV === 'development' ? 60 * 1000 : 1200 * 1000,
                onlyReturnFresh: true,
            },
        });
        if (newI18ns.length > 0) {
            const dataset = {};
            newI18ns.forEach(({ namespace, data, language }) => {
                if (dataset[language]) {
                    dataset[language][namespace] = data;
                }
                else {
                    dataset[language] = {
                        [namespace]: data,
                    };
                }
            });
            this.i18n.store(dataset);
            this.publish();
        }
        if (!this.hasKey(key)) {
            console.warn(`命名空间${ns}中的${key}缺失且可能请求不到更新的数据`);
            if (process.env.NODE_ENV === 'development') {
                console.warn('请增加好相应的键值后执行make:locale');
            }
        }
    }
    /**
     * 暴露给小程序的Wxs调用
     * @param key
     */
    loadMissedLocale(key) {
        this.loadData(key);
    }
    /**
     * translate函数，这里编译器会在params里注入两个参数 #oakNamespace 和 #oakModule，用以标识文件路径
     * @param key
     * @param params
     * @returns
     */
    t(key, params) {
        // return key as string;
        const ns = params['#oakNamespace'];
        const module = params['#oakModule'];
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
    hasKey(key, params) {
        this.i18n.missingBehavior = 'returnNull';
        const result = this.i18n.t(key, params);
        this.i18n.missingBehavior = 'loadData';
        return result;
    }
    // 这个是临时的代码（和locales没有关系），等和auth线合并了再移到合适的feature里去
    makeBridgeUrl(url, headers) {
        if (this.makeBridgeUrlFn) {
            return this.makeBridgeUrlFn(url, headers);
        }
        console.warn('development模式下无法使用bridge，直接使用原始url', url);
        return url;
    }
}
exports.Locales = Locales;
