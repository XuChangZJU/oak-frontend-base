import { BrowserHistory } from 'history';
import { Feature } from '../types/Feature';
export declare class Navigator extends Feature {
    history: BrowserHistory;
    constructor();
    /**
     * 必须使用这个方法注入history才能和react-router兼容
     * @param history
     */
    setHistory(history: BrowserHistory): void;
    getLocation(): import("history").Location;
    navigateTo(url: string, state?: Record<string, any>): Promise<void>;
    redirectTo(url: string, state?: Record<string, any>): Promise<void>;
    navigateBack(delta?: number): Promise<void>;
}
