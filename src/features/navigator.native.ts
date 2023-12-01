
import {
    OakNavigateToParameters,
} from '../types/Page';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
import {
    EntityDict,
} from 'oak-domain/lib/types';
import {
    NavigationContainerRefWithCurrent,
    StackActions,
    TabActions,
} from '@react-navigation/native';
import { Navigator as CommonNavigator } from './navigator.common';


export class Navigator extends CommonNavigator {
    history: NavigationContainerRefWithCurrent<ReactNavigation.RootParamList>;

    constructor() {
        super();
        this.history =
            {} as NavigationContainerRefWithCurrent<ReactNavigation.RootParamList>;
    }

    /**
     * 必须使用这个方法注入navigator
     * @param history
     */
    setHistory(
        history: NavigationContainerRefWithCurrent<ReactNavigation.RootParamList>
    ) {
        this.history = history;
    }

    getLocation() {
        const route = this.history.getCurrentRoute()!;
        return {
            pathname: route?.name,
            state: route?.params,
        };
    }

    getState() {
        const { pathname, state } = this.getLocation();
        const state2 = this.constructState(pathname!, state);
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
        const url2 = this.constructUrl(url, undefined, disableNamespace);
        const { pathname } = this.getLocation();
        const state2 = Object.assign({}, rest, state, {
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
        const pushAction = StackActions.push(url, props);
        this.history.dispatch(pushAction);
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
        const replaceAction = StackActions.replace(url, props);
        this.history.dispatch(replaceAction);
    }

    async switchTab<
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
        const jumpToAction = TabActions.jumpTo(url, props);
        this.history.dispatch(jumpToAction);
    }

    async navigateBack(delta?: number) {
        const canGoBack = this.history.canGoBack();
        if (canGoBack) {
            const popAction = StackActions.pop(delta || 1);
            this.history.dispatch(popAction);
        }
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
        const canGoBack = this.history.canGoBack();
        if (canGoBack) {
            this.navigateBack();
            return;
        }
        // 回最顶层
        this.history.dispatch(StackActions.popToTop());
    }
}
