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

    private base: string;

    constructor() {
        super();
        this.history = createBrowserHistory();
        this.namespace = '';
        this.base = 'http://localhost'; // 使用URL解析链接时 相对路径需要使用构建一个完整链接
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

    private urlParse(path: string) {
        const urlParse = new URL(path, this.base);
        return urlParse;
    }

    private urlFormat(url: URL) {
        const urlParse = new URL(url, this.base);
        const url2 = urlParse.toString();
        return url2.replace(this.base, '');
    }

    private getCurrentUrl() {
        const { pathname, search } = this.getLocation();
        // 构建search
        const search2 = this.constructSearch(search);
        const urlParse = this.urlParse(pathname);
        urlParse.pathname = pathname;
        urlParse.search = search2;
        urlParse.searchParams.delete('oakFrom'); //把上层传入的oakFrom排除
        const url = this.urlFormat(urlParse);

        return url;
    }

    private constructSearch(
        search?: string | null,
        state?: Record<string, any>
    ) {
        const searchParams = new URLSearchParams(search || '');
        if (state) {
            for (const param in state) {
                if (
                    state[param] !== undefined ||
                    state[param] !== 'undefined'
                ) {
                    searchParams.set(
                        param,
                        typeof state[param] === 'string'
                            ? state[param]
                            : JSON.stringify(state[param])
                    );
                }
            }
        }
        return searchParams.toString();
    }

    private constructUrl(
        url: string,
        state?: Record<string, any>,
        disableNamespace?: boolean
    ) {
        const urlParse = this.urlParse(url);
        const { pathname, search } = urlParse;

        let pathname2: string;
        if (disableNamespace) {
            pathname2 = this.getPathname(pathname!);
        } else {
            pathname2 = this.getPathname(pathname!, this.namespace);
        }
        // 构建search
        const search2 = this.constructSearch(search, state);
        urlParse.pathname = pathname2;
        urlParse.search = search2;
        const url2 = this.urlFormat(urlParse);

        return url2;
    }

    private constructNamespace(url: string, namespace?: string) {
        if (namespace) {
            const urlParse = this.urlParse(url);
            const { pathname, search } = urlParse;
            let pathname2 = pathname;
            if (namespace === '/') {
                pathname2 = pathname;
            } else if (pathname === namespace) {
                pathname2 = pathname;
            } else {
                pathname2 = namespace + pathname;
            }

            urlParse.pathname = pathname2;
            const url2 = this.urlFormat(urlParse);
            return url2;
        }
        return url;
    }

    getPathname(pathname: string, namespace?: string) {
        let pathname2 = pathname;
        if (namespace) {
            pathname2 = this.constructNamespace(pathname, namespace);
            return pathname2;
        }
        return pathname2;
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
        const oakFrom = this.getCurrentUrl();
        this.history.push(url2, Object.assign({}, state, { oakFrom }));
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
        const oakFrom = this.getCurrentUrl();
        this.history.replace(url2, Object.assign({}, state, { oakFrom }));
    }

    async switchTab<
        ED extends EntityDict & BaseEntityDict,
        T2 extends keyof ED
    >(
        options: { url: string } & OakNavigateToParameters<ED, T2>,
        state?: Record<string, any>,
        disableNamespace?: boolean
    ) {
        console.error('浏览器无switchTab');
        const { url, ...rest } = options;
        const url2 = this.constructUrl(url, rest, disableNamespace);
        const oakFrom = this.getCurrentUrl();
        this.history.replace(url2, Object.assign({}, state, { oakFrom }));
    }

    async navigateBack(delta?: number) {
        this.history.go(delta ? 0 - delta : -1);
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