import { createBrowserHistory } from 'history';
import { Feature } from '../types/Feature';
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
    async navigateTo(options, state, disableNamespace) {
        const url = this.getUrl(options, disableNamespace);
        this.history.push(url, state);
    }
    async redirectTo(options, state, disableNamespace) {
        const url = this.getUrl(options, disableNamespace);
        this.history.replace(url, state);
    }
    async switchTab(options, state, disableNamespace) {
        console.warn('浏览器无switchTab，为了适配小程序，小程序redirectTo无法跳到tabBar页面');
        const url = this.getUrl(options, disableNamespace);
        this.history.replace(url, state);
    }
    async navigateBack(delta) {
        this.history.go(delta ? 0 - delta : -1);
    }
    getUrl(options, disableNamespace) {
        const { url, ...rest } = options;
        let url2 = url;
        for (const param in rest) {
            const param2 = param;
            if (rest[param2] !== undefined) {
                url2 += `${url2.includes('?') ? '&' : '?'}${param}=${typeof rest[param2] === 'string'
                    ? rest[param2]
                    : JSON.stringify(rest[param2])}`;
            }
        }
        if (!disableNamespace && this.namespace) {
            // 处理this.namespace没加“/” 先加上“/”
            const namespace = this.namespace.startsWith('/')
                ? this.namespace
                : `/${this.namespace}`; // 格式为 /、/console
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
    navigateBackOrRedirectTo(options, state) {
        console.error('浏览器暂无法获得history堆栈');
        this.history.back();
    }
}
