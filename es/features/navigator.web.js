import { createBrowserHistory } from 'history';
import { Navigator as CommonNavigator } from './navigator.common';
export class Navigator extends CommonNavigator {
    history;
    constructor() {
        super();
        this.history = createBrowserHistory();
    }
    /**
     * 必须使用这个方法注入history才能和react-router兼容
     * @param history
     */
    setHistory(history) {
        this.history = history;
    }
    getLocation() {
        return this.history.location;
    }
    getCurrentUrl(needParams) {
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
    getPathname(pathname, namespace) {
        let pathname2 = pathname;
        if (namespace) {
            pathname2 = this.constructNamespace(pathname, namespace);
            return pathname2;
        }
        return pathname2;
    }
    getUrlAndProps(options, state, disableNamespace) {
        const { url, ...rest } = options;
        const url2 = this.constructUrl(url, rest, disableNamespace);
        const oakFrom = this.getCurrentUrl();
        const state2 = Object.assign({}, state, { oakFrom });
        return {
            url: url2,
            props: state2,
        };
    }
    async navigateTo(options, state, disableNamespace) {
        const { url, props } = this.getUrlAndProps(options, state, disableNamespace);
        this.history.push(url, props);
    }
    async redirectTo(options, state, disableNamespace) {
        const { url, props } = this.getUrlAndProps(options, state, disableNamespace);
        this.history.replace(url, props);
    }
    async switchTab(options, state, disableNamespace) {
        console.error('浏览器无switchTab');
        const { url, props } = this.getUrlAndProps(options, state, disableNamespace);
        this.history.replace(url, props);
    }
    async navigateBack(delta) {
        this.history.go(delta ? 0 - delta : -1);
    }
    navigateBackOrRedirectTo(options, state, disableNamespace) {
        console.error('浏览器暂无法获得history堆栈');
        this.history.back();
    }
}
