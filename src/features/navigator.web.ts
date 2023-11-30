import { createBrowserHistory, BrowserHistory } from 'history';
import { Feature } from '../types/Feature';
import {
    OakNavigateToParameters,
} from '../types/Page';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
import {
    EntityDict,
} from 'oak-domain/lib/types';
import { Navigator as CommonNavigator } from './navigator.common';

export class Navigator extends CommonNavigator {
    history: BrowserHistory;

    constructor() {
        super();
        this.history = createBrowserHistory();
    }

    /**
     * 必须使用这个方法注入history才能和react-router兼容
     * @param history
     */
    setHistory(history: BrowserHistory) {
        this.history = history;
    }

    getLocation() {
        return this.history.location;
    }

    getCurrentUrl(needParams?: boolean) {
        const { pathname, search } = this.getLocation();
        if (!needParams) {
            return pathname;
        }
        // 构建search
        const search2 = this.constructSearch(search);
        const urlParse = this.urlParse(pathname);
        urlParse.pathname = pathname;
        urlParse.search = search2;
        urlParse.searchParams.delete('oakFrom'); //把上层传入的oakFrom排除
        const url = this.urlFormat(urlParse);

        return url;
    }

    private getUrlAndProps<
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
        const state2 = Object.assign({}, state, { oakFrom }) as Record<
            string,
            any
        >;

        return {
            url: url2,
            props: state2,
        };
    }

    async navigateTo<
        ED extends EntityDict & BaseEntityDict,
        T2 extends keyof ED
    >(
        options: { url: string } & OakNavigateToParameters<ED, T2>,
        state?: Record<string, any>,
        disableNamespace?: boolean
    ) {
        const { url, props } = this.getUrlAndProps(
            options,
            state,
            disableNamespace
        );
        this.history.push(url, props);
    }

    async redirectTo<
        ED extends EntityDict & BaseEntityDict,
        T2 extends keyof ED
    >(
        options: { url: string } & OakNavigateToParameters<ED, T2>,
        state?: Record<string, any>,
        disableNamespace?: boolean
    ) {
        const { url, props } = this.getUrlAndProps(
            options,
            state,
            disableNamespace
        );
        this.history.replace(url, props);
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
        const { url, props } = this.getUrlAndProps(
            options,
            state,
            disableNamespace
        );
        this.history.replace(url, props);
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