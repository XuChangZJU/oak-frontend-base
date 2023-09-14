/// <reference types="wechat-miniprogram" />
import { Feature } from '../types/Feature';
import { OakNavigateToParameters } from '../types/Page';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
import { EntityDict } from 'oak-domain/lib/types';
type Location = {
    pathname: string;
    state: unknown;
    key: string;
};
export declare class Navigator extends Feature {
    namespace: string;
    history: WechatMiniprogram.Wx;
    constructor();
    setNamespace(namespace: string): void;
    getLocation(): Location;
    getNamespace(): string;
    private constructUrl;
    navigateTo<ED extends EntityDict & BaseEntityDict, T2 extends keyof ED>(options: {
        url: string;
    } & OakNavigateToParameters<ED, T2>, state?: Record<string, any>): Promise<unknown>;
    redirectTo<ED extends EntityDict & BaseEntityDict, T2 extends keyof ED>(options: {
        url: string;
    } & OakNavigateToParameters<ED, T2>, state?: Record<string, any>): Promise<unknown>;
    switchTab<ED extends EntityDict & BaseEntityDict, T2 extends keyof ED>(options: {
        url: string;
    } & OakNavigateToParameters<ED, T2>, state?: Record<string, any>): Promise<unknown>;
    navigateBack(delta?: number): Promise<unknown>;
    navigateBackOrRedirectTo<ED extends EntityDict & BaseEntityDict, T2 extends keyof ED>(options: {
        url: string;
        isTabBar?: boolean;
    } & OakNavigateToParameters<ED, T2>, state?: Record<string, any>): Promise<unknown>;
}
export {};
