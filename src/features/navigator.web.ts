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
        this.publish();
    }

    getLocation() {
        return this.history.location;
    }

    getNamespace() {
        return this.namespace;
    }

    async navigateTo<
        ED extends EntityDict & BaseEntityDict,
        T2 extends keyof ED
    >(
        options: { url: string } & OakNavigateToParameters<ED, T2>,
        state?: Record<string, any>,
        disableNamespace?: boolean
    ) {
        const { url, ...rest } = options;

        const url2 = this.constructUrl(url, rest, disableNamespace);
        this.history.push(url2, state);
    }

    async redirectTo<
        ED extends EntityDict & BaseEntityDict,
        T2 extends keyof ED
    >(
        options: { url: string } & OakNavigateToParameters<ED, T2>,
        state?: Record<string, any>,
        disableNamespace?: boolean
    ) {
        const { url, ...rest } = options;

        const url2 = this.constructUrl(url, rest, disableNamespace);
        this.history.replace(url2, state);
    }

    async switchTab<
        ED extends EntityDict & BaseEntityDict,
        T2 extends keyof ED
    >(
        options: { url: string } & OakNavigateToParameters<ED, T2>,
        state?: Record<string, any>,
        disableNamespace?: boolean
    ) {
        console.warn(
            '浏览器无switchTab，为了适配小程序，小程序redirectTo无法跳到tabBar页面'
        );
        const { url, ...rest } = options;
        const url2 = this.constructUrl(url, options, disableNamespace);
        this.history.replace(url2, state);
    }

    async navigateBack(delta?: number) {
        this.history.go(delta ? 0 - delta : -1);
    }

    private constructUrl(
        url: string,
        state?: Record<string, any>,
        disableNamespace?: boolean
    ) {
        let url2 = url;

        for (const param in state) {
            const param2 = param as unknown as keyof typeof state;
            if (state[param2] !== undefined) {
                url2 += `${url2.includes('?') ? '&' : '?'}`;
                url2 += `${param}=${
                    typeof state[param2] === 'string'
                        ? state[param2]
                        : JSON.stringify(state[param2])
                }`;
            }
        }
        url2 = this.constructNamespace(url2, disableNamespace);
        return url2;
    }

    private constructNamespace(url: string, disableNamespace?: boolean) {
        let url2 = url;

        if (!disableNamespace && this.namespace) {
            // 处理this.namespace 前缀未设置“/”, 先置上“/”, 格式为 /console
            const namespace = this.namespace.startsWith('/')
                ? this.namespace
                : `/${this.namespace}`;
            const urls = url2.split('?');
            const urls_0 = urls[0] || '';
            if (namespace === '/') {
                url2 = url2;
            } else if (namespace !== '/' && urls_0 === '') {
                url2 = namespace + url2;
            } else if (namespace !== '/' && urls_0 === '/') {
                url2 = namespace + url2.substring(1, url2.length);
            } else {
                url2 = namespace + (url2.startsWith('/') ? '' : '/') + url2;
            }
        }
        return url2;
    }

    navigateBackOrRedirectTo<
        ED extends EntityDict & BaseEntityDict,
        T2 extends keyof ED
    >(
        options: { url: string; isTabBar?: boolean } & OakNavigateToParameters<
            ED,
            T2
        >,
        state?: Record<string, any>,
        disableNamespace?: boolean
    ) {
        console.error('浏览器暂无法获得history堆栈');
        this.history.back();
    }
}