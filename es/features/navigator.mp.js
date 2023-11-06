import { assert } from 'oak-domain/lib/utils/assert';
import URL from 'url';
import { Feature } from '../types/Feature';
export class Navigator extends Feature {
    namespace;
    history;
    constructor() {
        super();
        this.history = wx;
        this.namespace = '';
    }
    setNamespace(namespace) {
        this.namespace = namespace;
        this.publish();
    }
    getLocation() {
        const pages = getCurrentPages(); //获取加载的页面
        const currentPage = pages[pages.length - 1]; //获取当前页面的对象
        const url = currentPage.route; //当前页面url
        const options = currentPage.options; //如果要获取url中所带的参数可以查看options
        const pathname = url
            .replace('/pages', '')
            .replace('pages', '')
            .replace('/index', '');
        return {
            pathname: pathname,
            state: options,
            key: `${pages.length - 1}`,
        };
    }
    getNamespace() {
        return this.namespace;
    }
    constructUrl(url, state, disableNamespace) {
        const urlParse = URL.parse(url, true);
        const { pathname, search } = urlParse;
        if (!/^\/{1}/.test(pathname)) {
            assert(false, 'url前面必须以/开头');
        }
        // 格式:/house/list 前面加上/pages 后面加上/index
        if (pathname?.indexOf('pages') !== -1 ||
            pathname?.lastIndexOf('index') !== -1) {
            assert(false, 'url两边不需要加上/pages和/index');
        }
        let pathname2 = this.constructNamespace(pathname, disableNamespace);
        pathname2 = `/pages${pathname2}/index`;
        let search2 = search;
        if (state) {
            for (const param in state) {
                if (!search2) {
                    search2 = '?';
                }
                if (state[param] !== undefined) {
                    search2 += `&${param}=${typeof state[param] === 'string'
                        ? state[param]
                        : JSON.stringify(state[param])}`;
                }
            }
        }
        const url2 = URL.format({
            pathname: pathname2,
            search: search2,
        });
        return url2;
    }
    constructNamespace(url, disableNamespace) {
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
            }
            else if (namespace !== '/' && urls_0 === '') {
                url2 = namespace + url2;
            }
            else if (namespace !== '/' && urls_0 === '/') {
                url2 = namespace + url2.substring(1, url2.length);
            }
            else {
                url2 = namespace + (url2.startsWith('/') ? '' : '/') + url2;
            }
        }
        return url2;
    }
    navigateTo(options, state, disableNamespace) {
        const { url, ...rest } = options;
        const url2 = this.constructUrl(url, Object.assign({}, rest, state), disableNamespace);
        return new Promise((resolve, reject) => {
            wx.navigateTo({
                url: url2,
                success: () => resolve(undefined),
                fail: (err) => reject(err),
            });
        });
    }
    //  关闭当前页面，跳转到应用内的某个页面，但不允许跳转到tabBar页面。
    redirectTo(options, state, disableNamespace) {
        const { url, ...rest } = options;
        const url2 = this.constructUrl(url, Object.assign({}, rest, state), disableNamespace);
        return new Promise((resolve, reject) => {
            wx.redirectTo({
                url: url2,
                success: () => resolve(undefined),
                fail: (err) => reject(err),
            });
        });
    }
    //跳转到tabBar页面，并关闭其他所有非tabBar页面，用于跳转到主页。
    switchTab(options, state, disableNamespace) {
        const { url, ...rest } = options;
        const url2 = this.constructUrl(url, Object.assign({}, rest, state), disableNamespace);
        return new Promise((resolve, reject) => {
            wx.switchTab({
                url: url2,
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
