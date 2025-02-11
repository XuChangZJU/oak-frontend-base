import { Feature } from '../types/Feature';
import {
    url as URL,
    urlSearchParams as URLSearchParams,
} from 'oak-domain/lib/utils/url';

export class Navigator extends Feature {
    namespace: string;

    private base: string;

    constructor() {
        super();
        this.namespace = '';
        this.base = 'http://oak-localhost'; // 使用URL解析链接时 相对路径需要使用构建一个完整链接
    }

    setNamespace(namespace: string) {
        this.namespace = namespace;
        this.publish();
    }

    getNamespace() {
        return this.namespace;
    }

    urlParse(path: string) {
        const urlParse = new URL(path, this.base);
        return urlParse;
    }

    urlFormat(url: URL) {
        const urlParse = new URL(url.toString(), this.base);
        let url2 = urlParse.toString();
        if (process.env.OAK_PLATFORM !== 'web') {
            url2 = decodeURIComponent(url2)
        }
        return url2.replace(this.base, '');
    }

    constructState(
        pathname: string,
        state?: Record<string, any>,
        search?: string
    ) {
        // 构建search
        const search2 = this.constructSearch(search, state);
        const searchParams = new URLSearchParams(search2 || '');
        const oakFrom = searchParams.get('oakFrom') as string;
        return {
            pathname,
            oakFrom: oakFrom ? decodeURIComponent(oakFrom) : undefined,
        };
    }

    constructSearch(search?: string | null, state?: Record<string, any>) {
        const searchParams = new URLSearchParams(search || '');
        if (state) {
            for (const param in state) {
                if (
                    state[param] !== undefined &&
                    state[param] !== 'undefined'
                ) {
                    searchParams.set(
                        param,
                        typeof state[param] === 'string'
                            ? state[param]
                            : JSON.stringify(state[param])
                    );
                }
            }
        }
        let searchStr = searchParams.toString()
        searchStr = decodeURIComponent(searchStr)
        return searchStr;
    }

    constructUrl(
        url: string,
        state?: Record<string, any>,
        disableNamespace?: boolean
    ) {
        const urlParse = this.urlParse(url);
        const { pathname, search } = urlParse;

        let pathname2: string;
        if (disableNamespace) {
            pathname2 = this.getPathname(pathname!);
        } else {
            pathname2 = this.getPathname(pathname!, this.namespace);
        }
        // 构建search
        const search2 = this.constructSearch(search, state);
        urlParse.pathname = pathname2;
        urlParse.search = search2;
        const url2 = this.urlFormat(urlParse);

        return url2;
    }

    constructNamespace(url: string, namespace?: string) {
        if (namespace) {
            // url传入空字符串，经过urlParse处理后，pathname返回"/"
            const urlParse = this.urlParse(url);
            const { pathname } = urlParse;
            let pathname2 = pathname;
            if (namespace === '/') {
                pathname2 = pathname;
            } else if (pathname === '/') {
                // 出现这个情况 直接返回根路由
                pathname2 = namespace;
            } else if (pathname === namespace) {
                pathname2 = pathname;
            } else {
                pathname2 = namespace + pathname;
            }

            urlParse.pathname = pathname2;
            const url2 = this.urlFormat(urlParse);
            return url2;
        }
        return url;
    }

    getPathname(pathname: string, namespace?: string) {
        let pathname2 = pathname;
        if (namespace) {
            pathname2 = this.constructNamespace(pathname, namespace);
            return pathname2;
        }
        return pathname2;
    }
}