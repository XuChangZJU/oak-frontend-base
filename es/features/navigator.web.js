import { createBrowserHistory } from 'history';
import { Feature } from '../types/Feature';
import URL from 'url';
export class Navigator extends Feature {
    history;
    namespace;
    constructor() {
        super();
        this.history = createBrowserHistory();
        this.namespace = '';
    }
    /**
     * 必须使用这个方法注入history才能和react-router兼容
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
        return this.history.location;
    }
    getNamespace() {
        return this.namespace;
    }
    getCurrentUrl() {
        const { pathname, search } = this.getLocation();
        // 构建search
        const search2 = this.constructSearch(search);
        const url = URL.format({
            pathname,
            search: search2,
        });
        return url;
    }
    constructSearch(search, state) {
        let search2 = search;
        if (state) {
            for (const param in state) {
                if (!search2) {
                    search2 = '?';
                }
                if (state[param] !== undefined ||
                    state[param] !== 'undefined') {
                    search2 += `&${param}=${typeof state[param] === 'string'
                        ? state[param]
                        : JSON.stringify(state[param])}`;
                }
            }
        }
        return search2;
    }
    constructUrl(url, state, disableNamespace) {
        const urlParse = URL.parse(url, true);
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
        const url2 = URL.format({
            pathname: pathname2,
            search: search2,
        });
        return url2;
    }
    constructNamespace(url, namespace) {
        if (namespace) {
            const urlParse = URL.parse(url, true);
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
            const url2 = URL.format({
                pathname: pathname2,
                search,
            });
            return url2;
        }
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
    async navigateTo(options, state, disableNamespace) {
        const { url, ...rest } = options;
        const url2 = this.constructUrl(url, rest, disableNamespace);
        const oakFrom = this.getCurrentUrl();
        this.history.push(url2, Object.assign({}, state, { oakFrom }));
    }
    async redirectTo(options, state, disableNamespace) {
        const { url, ...rest } = options;
        const url2 = this.constructUrl(url, rest, disableNamespace);
        const oakFrom = this.getCurrentUrl();
        this.history.replace(url2, Object.assign({}, state, { oakFrom }));
    }
    async switchTab(options, state, disableNamespace) {
        console.error('浏览器无switchTab');
        const { url, ...rest } = options;
        const url2 = this.constructUrl(url, rest, disableNamespace);
        const oakFrom = this.getCurrentUrl();
        this.history.replace(url2, Object.assign({}, state, { oakFrom }));
    }
    async navigateBack(delta) {
        this.history.go(delta ? 0 - delta : -1);
    }
    navigateBackOrRedirectTo(options, state, disableNamespace) {
        console.error('浏览器暂无法获得history堆栈');
        this.history.back();
    }
}
