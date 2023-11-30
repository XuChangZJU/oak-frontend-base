import { Feature } from '../types/Feature';
export class Navigator extends Feature {
    namespace;
    base;
    constructor() {
        super();
        this.namespace = '';
        this.base = 'http://localhost'; // 使用URL解析链接时 相对路径需要使用构建一个完整链接
    }
    setNamespace(namespace) {
        this.namespace = namespace;
        this.publish();
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
    constructNamespace(url, namespace) {
        if (namespace) {
            const urlParse = this.urlParse(url);
            const { pathname } = urlParse;
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
}
