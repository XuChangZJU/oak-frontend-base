import { assert } from 'oak-domain/lib/utils/assert';
import { OakNavigateToParameters } from '../types/Page';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
import { EntityDict } from 'oak-domain/lib/types';
import { Navigator as CommonNavigator } from './navigator.common';

type Location = {
    pathname: string;
    state?: Record<string, any>;
    key: string;
};

export class Navigator extends CommonNavigator {
    history: WechatMiniprogram.Wx;

    constructor() {
        super();
        this.history = wx;
    }

    getLocation(): Location {
        //初始化的时候
        const pages = getCurrentPages(); //获取加载的页面
        const currentPage = pages[pages.length - 1]; //获取当前页面的对象
        const url = currentPage?.route; //当前页面url
        const options = currentPage?.options; //如果要获取url中所带的参数可以查看options
        const pathname = url ? url
            .replace('/pages', '')
            .replace('pages', '')
            .replace('/index', '') : '';
        return {
            pathname: pathname,
            state: options,
            key: `${pages.length - 1}`,
        };
    }

    getState() {
        const { pathname, state } = this.getLocation();
        const state2 = this.constructState(pathname!, state);
        return state2;
    }

    getPathname(pathname: string, namespace?: string) {
        if (!/^\/{1}/.test(pathname!)) {
            assert(false, 'url前面必须以/开头');
        }
        // 格式:/house/list 前面加上/pages 后面加上/index
        if (
            pathname?.indexOf('pages') !== -1 ||
            pathname?.lastIndexOf('index') !== -1
        ) {
            assert(false, 'url两边不需要加上/pages和/index');
        }
        let pathname2 = pathname;
        if (namespace) {
            const pathname3 = this.constructNamespace(pathname, namespace);
            pathname2 = `/pages${pathname3}/index`;
            return pathname2;
        }
        return `/pages${pathname2}/index`;
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
        const { pathname } = this.getLocation();
        const state2 = Object.assign({}, rest, state, {
            oakFrom: pathname,
        }) as Record<string, any>;
        const url2 = this.constructUrl(url, state2, disableNamespace);

        return {
            url: url2,
        };
    }

    navigateTo<ED extends EntityDict & BaseEntityDict, T2 extends keyof ED>(
        options: { url: string } & OakNavigateToParameters<ED, T2>,
        state?: Record<string, any>,
        disableNamespace?: boolean
    ) {
        const { url } = this.getUrlAndProps(options, state, disableNamespace);
        return new Promise((resolve, reject) => {
            wx.navigateTo({
                url: url,
                success: () => resolve(undefined),
                fail: (err) => reject(err),
            });
        });
    }

    //  关闭当前页面，跳转到应用内的某个页面，但不允许跳转到tabBar页面。
    redirectTo<ED extends EntityDict & BaseEntityDict, T2 extends keyof ED>(
        options: { url: string } & OakNavigateToParameters<ED, T2>,
        state?: Record<string, any>,
        disableNamespace?: boolean
    ) {
        const { url } = this.getUrlAndProps(options, state, disableNamespace);

        return new Promise((resolve, reject) => {
            wx.redirectTo({
                url: url,
                success: () => resolve(undefined),
                fail: (err) => reject(err),
            });
        });
    }

    //跳转到tabBar页面，并关闭其他所有非tabBar页面，用于跳转到主页。
    switchTab<ED extends EntityDict & BaseEntityDict, T2 extends keyof ED>(
        options: { url: string } & OakNavigateToParameters<ED, T2>,
        state?: Record<string, any>,
        disableNamespace?: boolean
    ) {
        const { url } = this.getUrlAndProps(options, state, disableNamespace);
        return new Promise((resolve, reject) => {
            wx.switchTab({
                url: url,
                success: () => resolve(undefined),
                fail: (err) => reject(err),
            });
        });
    }

    navigateBack(delta?: number) {
        return new Promise((resolve, reject) => {
            wx.navigateBack({
                delta: delta || 1,
                success: () => resolve(undefined),
                fail: (err) => reject(err),
            });
        });
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
        const pages = getCurrentPages();
        if (pages.length > 1) {
            return this.navigateBack();
        }
        const isTabBar = options?.isTabBar;
        if (isTabBar) {
            return this.switchTab(options, state, disableNamespace);
        }
        return this.redirectTo(options, state, disableNamespace);
    }
}
