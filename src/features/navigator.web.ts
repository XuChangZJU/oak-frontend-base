import { createBrowserHistory, BrowserHistory } from 'history';
import { Feature } from '../types/Feature';


export class Navigator extends Feature{
    history: BrowserHistory;

    constructor() {
        super();
        this.history = createBrowserHistory();
    }

    /**
     * 必须使用这个方法注入history才能和react-router兼容
     * @param history 
     */
    setHistory(history: BrowserHistory) {
        this.history = history;
    }

    getLocation() {
        return this.history.location;
    }

    async navigateTo(url: string, state?: Record<string, any>) {
        this.history.push(url, state);
    }

    async redirectTo(url: string, state?: Record<string, any>) {
        this.history.replace(url, state);
    }

    async navigateBack(delta: number = 1) {
        this.history.go(0 - delta);
    }
}