import { Feature } from '../types/Feature';
import { StackActions, TabActions, } from '@react-navigation/native';
export class Navigator extends Feature {
    history;
    namespace;
    base;
    constructor() {
        super();
        this.history =
            {};
        this.namespace = '';
        this.base = 'http://localhost'; // 使用URL解析链接时 相对路径需要使用构建一个完整链接
    }
    /**
     * 必须使用这个方法注入navigator
     * @param history
     */
    setHistory(history) {
        this.history = history;
    }
    setNamespace(namespace) {
        this.namespace = namespace;
        this.publish();
    }
    getLocation() {
        const route = this.history.getCurrentRoute();
        return {
            pathname: route.name,
            state: route.params,
        };
    }
    getNamespace() {
        return this.namespace;
    }
    urlParse(path) {
        const urlParse = new URL(path, this.base);
        return urlParse;
    }
    urlFormat(url) {
        const urlParse = new URL(url, this.base);
        const url2 = urlParse.toString();
        return url2.replace(this.base, '');
    }
    getCurrentUrl() {
        const { pathname, state } = this.getLocation();
        // 构建search
        const search2 = this.constructSearch('', state);
        const urlParse = this.urlParse(pathname);
        urlParse.pathname = pathname;
        urlParse.search = search2;
        urlParse.searchParams.delete('oakFrom'); //把上层传入的oakFrom排除
        const url = this.urlFormat(urlParse);
        return url;
    }
    constructSearch(search, state) {
        const searchParams = new URLSearchParams(search || '');
        if (state) {
            for (const param in state) {
                if (state[param] !== undefined ||
                    state[param] !== 'undefined') {
                    searchParams.set(param, typeof state[param] === 'string'
                        ? state[param]
                        : JSON.stringify(state[param]));
                }
            }
        }
        return searchParams.toString();
    }
    constructUrl(url, state, disableNamespace) {
        const urlParse = this.urlParse(url);
        const { pathname, search } = urlParse;
        let pathname2;
        if (disableNamespace) {
            pathname2 = this.getPathname(pathname);
        }
        else {
            pathname2 = this.getPathname(pathname, this.namespace);
        }
        // 构建search
        const search2 = this.constructSearch(search, state);
        urlParse.pathname = pathname2;
        urlParse.search = search2;
        const url2 = this.urlFormat(urlParse);
        return url2;
    }
    constructNamespace(path, namespace) {
        if (namespace) {
            const urlParse = this.urlParse(path);
            const { pathname, search } = urlParse;
            let pathname2 = pathname;
            if (namespace === '/') {
                pathname2 = pathname;
            }
            else if (pathname === namespace) {
                pathname2 = pathname;
            }
            else {
                pathname2 = namespace + pathname;
            }
            urlParse.pathname = pathname2;
            const url2 = this.urlFormat(urlParse);
            return url2;
        }
        return path;
    }
    getPathname(pathname, namespace) {
        let pathname2 = pathname;
        if (namespace) {
            pathname2 = this.constructNamespace(pathname, namespace);
            return pathname2;
        }
        return pathname2;
    }
    async navigateTo(options, state, disableNamespace) {
        const { url, ...rest } = options;
        const url2 = this.constructUrl(url, undefined, disableNamespace);
        const oakFrom = this.getCurrentUrl();
        const pushAction = StackActions.push(url2, Object.assign({
            oakFrom,
        }, rest, state));
        this.history.dispatch(pushAction);
    }
    async redirectTo(options, state, disableNamespace) {
        const { url, ...rest } = options;
        const url2 = this.constructUrl(url, undefined, disableNamespace);
        const oakFrom = this.getCurrentUrl();
        const replaceAction = StackActions.replace(url2, Object.assign({
            oakFrom,
        }, rest, state));
        this.history.dispatch(replaceAction);
    }
    async switchTab(options, state, disableNamespace) {
        const { url, ...rest } = options;
        const url2 = this.constructUrl(url, undefined, disableNamespace);
        const oakFrom = this.getCurrentUrl();
        const jumpToAction = TabActions.jumpTo(url2, Object.assign({
            oakFrom,
        }, rest, state));
        this.history.dispatch(jumpToAction);
    }
    async navigateBack(delta) {
        const canGoBack = this.history.canGoBack();
        if (canGoBack) {
            const popAction = StackActions.pop(delta || 1);
            this.history.dispatch(popAction);
        }
    }
    navigateBackOrRedirectTo(options, state, disableNamespace) {
        const canGoBack = this.history.canGoBack();
        if (canGoBack) {
            this.navigateBack();
            return;
        }
        // 回最顶层
        this.history.dispatch(StackActions.popToTop());
    }
}
