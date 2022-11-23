import { createBrowserHistory, BrowserHistory } from 'history';
import { Feature } from '../types/Feature';


export class Navigator extends Feature{
    history: BrowserHistory;
    namespace: string;

    constructor() {
        super();
        this.history = createBrowserHistory();
        this.namespace = '';
    }

    /**
     * 必须使用这个方法注入history才能和react-router兼容
     * @param history 
     */
    setHistory(history: BrowserHistory) {
        this.history = history;
    }

    setNamespace(namespace: string) {
        this.namespace = namespace;
    }

    getLocation() {
        return this.history.location;
    }

    async navigateTo(url: string, state?: Record<string, any>, disableNamespace?: boolean) {
        let url2 = url;
        if (!disableNamespace && this.namespace) {
            url2 = (this.namespace.startsWith('/') ? '' : '/') +
                (this.namespace === '/' ? '' : this.namespace) +
                (url2.startsWith('/') ? '' : '/') +
                url2;
        }
        this.history.push(url2, state);
    }

    async redirectTo(url: string, state?: Record<string, any>, disableNamespace?: boolean) {
        let url2 = url;
        if (!disableNamespace && this.namespace) {
            url2 = (this.namespace.startsWith('/') ? '' : '/') +
                (this.namespace === '/' ? '' : this.namespace) +
                (url2.startsWith('/') ? '' : '/') +
                url2;
        }
        this.history.replace(url2, state);
    }

    async navigateBack(delta: number = 1) {
        this.history.go(0 - delta);
    }
}