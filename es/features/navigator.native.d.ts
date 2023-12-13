import { OakNavigateToParameters } from '../types/Page';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
import { EntityDict } from 'oak-domain/lib/types';
import { NavigationContainerRefWithCurrent } from '@react-navigation/native';
import { Navigator as CommonNavigator } from './navigator.common';
export declare class Navigator extends CommonNavigator {
    history: NavigationContainerRefWithCurrent<ReactNavigation.RootParamList>;
    constructor();
    /**
     * 必须使用这个方法注入navigator
     * @param history
     */
    setHistory(history: NavigationContainerRefWithCurrent<ReactNavigation.RootParamList>): void;
    getLocation(): {
        pathname: string;
        state: Readonly<object | undefined>;
    };
    getState(): {
        pathname: string;
        oakFrom: string | undefined;
    };
    private getUrlAndProps;
    navigateTo<ED extends EntityDict & BaseEntityDict, T2 extends keyof ED>(options: {
        url: string;
    } & OakNavigateToParameters<ED, T2>, state?: Record<string, any>, disableNamespace?: boolean): Promise<void>;
    redirectTo<ED extends EntityDict & BaseEntityDict, T2 extends keyof ED>(options: {
        url: string;
    } & OakNavigateToParameters<ED, T2>, state?: Record<string, any>, disableNamespace?: boolean): Promise<void>;
    switchTab<ED extends EntityDict & BaseEntityDict, T2 extends keyof ED>(options: {
        url: string;
    } & OakNavigateToParameters<ED, T2>, state?: Record<string, any>, disableNamespace?: boolean): Promise<void>;
    navigateBack(delta?: number): Promise<void>;
    navigateBackOrRedirectTo<ED extends EntityDict & BaseEntityDict, T2 extends keyof ED>(options: {
        url: string;
        isTabBar?: boolean;
    } & OakNavigateToParameters<ED, T2>, state?: Record<string, any>, disableNamespace?: boolean): void;
}
