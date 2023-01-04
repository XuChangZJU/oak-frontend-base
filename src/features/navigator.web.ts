import { createBrowserHistory, BrowserHistory } from 'history';
import { Feature } from '../types/Feature';
import {
    OakNavigateToParameters,
} from '../types/Page';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
import {
    EntityDict,
} from 'oak-domain/lib/types';

export class Navigator extends Feature {
    history: BrowserHistory;
    namespace: string;

    constructor() {
        super();
        this.history = createBrowserHistory();
        this.namespace = '';
    }

    /**
     * 必须使用这个方法注入history才能和react-router兼容
     * @param history
     */
    setHistory(history: BrowserHistory) {
        this.history = history;
    }

    setNamespace(namespace: string) {
        this.namespace = namespace;
    }

    getLocation() {
        return this.history.location;
    }

    getNamespace() {
        return this.namespace;
    }

    async navigateTo<ED extends EntityDict & BaseEntityDict, T2 extends keyof ED>(
        options: { url: string } & OakNavigateToParameters<ED, T2>,
        state?: Record<string, any>,
        disableNamespace?: boolean
    ) {
        const url = this.getUrl(options, disableNamespace);
        this.history.push(url, state);
    }

    async redirectTo<ED extends EntityDict & BaseEntityDict, T2 extends keyof ED>(
        options: { url: string } & OakNavigateToParameters<ED, T2>,
        state?: Record<string, any>,
        disableNamespace?: boolean
    ) {
        const url = this.getUrl(options, disableNamespace);
        this.history.replace(url, state);
    }

    async navigateBack(delta?: number) {
        this.history.go(delta ? 0 - delta : -1);
    }

    private getUrl<ED extends EntityDict & BaseEntityDict, T2 extends keyof ED>(
        options: { url: string } & OakNavigateToParameters<ED, T2>,
        disableNamespace?: boolean
    ) {
        const { url, ...rest } = options;
        let url2 = url;

        for (const param in rest) {
            const param2 = param as unknown as keyof typeof rest;
            if (rest[param2] !== undefined) {
                url2 += `${url2.includes('?') ? '&' : '?'}${param}=${
                    typeof rest[param2] === 'string'
                        ? rest[param2]
                        : JSON.stringify(rest[param2])
                }`;
            }
        }
        if (!disableNamespace && this.namespace) {
            // 处理this.namespace没加“/” 先加上“/”
            const namespace = this.namespace.startsWith('/')
                ? this.namespace
                : `/${this.namespace}`; // 格式为 /、/console
            const urls = url2.split('?');
            const urls_0 = urls[0] || '';
            if (namespace === '/') {
                url2 = url2;
                if (urls_0 === '/') {
                    url2 = url2.substring(1, url2.length);
                }
            } else if (namespace !== '/' && urls_0 === '') {
                url2 = namespace + url2;
            } else if (namespace !== '/' && urls_0 === '/') {
                url2 = namespace + url2.substring(1, url2.length);
            } else {
                url2 = namespace + (url2.startsWith('/') ? '' : '/') + url2;
            }  
            // url2 =
            //     (this.namespace.startsWith('/') ? '' : '/') +
            //     (this.namespace === '/' ? '' : this.namespace) +
            //     (url2.startsWith('/') ? '' : '/') +
            //     url2;
        }

        return url2;
    }
}