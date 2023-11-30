/// <reference types="wechat-miniprogram" />
import { OakNavigateToParameters } from '../types/Page';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
import { EntityDict } from 'oak-domain/lib/types';
import { Navigator as CommonNavigator } from './navigator.common';
type Location = {
    pathname: string;
    state?: Record<string, any>;
    key: string;
};
export declare class Navigator extends CommonNavigator {
    history: WechatMiniprogram.Wx;
    constructor();
    getLocation(): Location;
    getCurrentUrl(needParams?: boolean): string;
    getPathname(pathname: string, namespace?: string): string;
    private getUrlAndProps;
    navigateTo<ED extends EntityDict & BaseEntityDict, T2 extends keyof ED>(options: {
        url: string;
    } & OakNavigateToParameters<ED, T2>, state?: Record<string, any>, disableNamespace?: boolean): Promise<unknown>;
    redirectTo<ED extends EntityDict & BaseEntityDict, T2 extends keyof ED>(options: {
        url: string;
    } & OakNavigateToParameters<ED, T2>, state?: Record<string, any>, disableNamespace?: boolean): Promise<unknown>;
    switchTab<ED extends EntityDict & BaseEntityDict, T2 extends keyof ED>(options: {
        url: string;
    } & OakNavigateToParameters<ED, T2>, state?: Record<string, any>, disableNamespace?: boolean): Promise<unknown>;
    navigateBack(delta?: number): Promise<unknown>;
    navigateBackOrRedirectTo<ED extends EntityDict & BaseEntityDict, T2 extends keyof ED>(options: {
        url: string;
        isTabBar?: boolean;
    } & OakNavigateToParameters<ED, T2>, state?: Record<string, any>, disableNamespace?: boolean): Promise<unknown>;
}
export {};
