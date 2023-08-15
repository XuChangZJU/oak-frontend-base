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

const LS_LNG_KEY = 'ofb-feature-locale-lng';

export class Locales<ED extends EntityDict & BaseEntityDict, Cxt extends AsyncContext<ED>, FrontCxt extends SyncContext<ED>, AD extends CommonAspectDict<ED, Cxt>> extends Feature {
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
        const savedLng = localStorage.load(LS_LNG_KEY);
        if (savedLng) {
            this.language = savedLng;
            this.resetDataset();
        }
        else {
            this.language = defaultLng;
            this.detectLanguange();
        }
        this.i18n = new I18n(undefined, {
            defaultLocale: defaultLng,
            locale: this.language,
        });

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
        this.localStorage.save(LS_LNG_KEY, language);
        this.resetDataset();
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
            }
        );
        this.i18n.store(dataset);
    }

    /**
     * 当发生key缺失时，向服务器请求最新的i18n数据，这里要注意要避免因服务器也缺失导致的无限请求
     * @param ns 
     */
    private async loadData(key: Scope) {
        assert(typeof key === 'string');
        const [ ns, key2 ] = key.split(':');
        const currentI18ns = this.cache.get('i18n', {
            data: {
                id: 1,
                $$updateAt$$: 1,
            },
            filter: {
                namespace: ns,
                language: {
                    $in: [this.language, this.defaultLng].filter(ele => !!ele)
                },
            }
        });

        const filters: NonNullable<EntityDict['i18n']['Selection']['filter']>[] = [this.language, this.defaultLng].map(
            ele => {
                const current = currentI18ns.find(ele2 => ele2.namespace === ele);
                if (current) {
                    return {
                        namespace: ele,
                        $$updateAt$$: {
                            $gt: current.$$updateAt$$,
                        },
                    };
                }
                return {
                    namespace: ele,
                };
            }
        );
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
                $or: filters,
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

    t(key: Scope, params?: TranslateOptions) {
        return this.i18n.t(key, params);
    }

    // 需要暴露给小程序
    getDataSet() {
        return {
            lng: this.language,
            defaultLng: this.defaultLng,
            dataset: this.i18n.translations,
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
