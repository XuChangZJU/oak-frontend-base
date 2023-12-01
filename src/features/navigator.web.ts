import { createBrowserHistory, BrowserHistory } from 'history';
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

    getState() {
        const { pathname, state, search } = this.getLocation();
        const state2 = this.constructState(
            pathname!,
            state as Record<string, any>,
            search
        );
        return state2;
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
        const { pathname } = this.getLocation();
        const state2 = Object.assign({}, state, {
            oakFrom: pathname,
        }) as Record<string, any>;

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