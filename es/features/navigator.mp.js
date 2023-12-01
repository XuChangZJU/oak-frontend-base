import { assert } from 'oak-domain/lib/utils/assert';
import { Navigator as CommonNavigator } from './navigator.common';
export class Navigator extends CommonNavigator {
    history;
    constructor() {
        super();
        this.history = wx;
    }
    getLocation() {
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
        const state2 = this.constructState(pathname, state);
        return {
            pathname: state2.pathname,
            oakFrom: state2.oakFrom
                ? decodeURIComponent(state2.oakFrom)
                : '',
        };
    }
    getPathname(pathname, namespace) {
        if (!/^\/{1}/.test(pathname)) {
            assert(false, 'url前面必须以/开头');
        }
        // 格式:/house/list 前面加上/pages 后面加上/index
        if (pathname?.indexOf('pages') !== -1 ||
            pathname?.lastIndexOf('index') !== -1) {
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
    getUrlAndProps(options, state, disableNamespace) {
        const { url, ...rest } = options;
        const { pathname } = this.getLocation();
        const state2 = Object.assign({}, rest, state, {
            oakFrom: pathname,
        });
        const url2 = this.constructUrl(url, state2, disableNamespace);
        return {
            url: url2,
        };
    }
    navigateTo(options, state, disableNamespace) {
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
    redirectTo(options, state, disableNamespace) {
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
    switchTab(options, state, disableNamespace) {
        const { url } = this.getUrlAndProps(options, state, disableNamespace);
        return new Promise((resolve, reject) => {
            wx.switchTab({
                url: url,
                success: () => resolve(undefined),
                fail: (err) => reject(err),
            });
        });
    }
    navigateBack(delta) {
        return new Promise((resolve, reject) => {
            wx.navigateBack({
                delta: delta || 1,
                success: () => resolve(undefined),
                fail: (err) => reject(err),
            });
        });
    }
    navigateBackOrRedirectTo(options, state, disableNamespace) {
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
