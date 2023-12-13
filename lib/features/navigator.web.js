"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Navigator = void 0;
const history_1 = require("history");
const navigator_common_1 = require("./navigator.common");
class Navigator extends navigator_common_1.Navigator {
    history;
    constructor() {
        super();
        this.history = (0, history_1.createBrowserHistory)();
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
    getState() {
        const { pathname, state, search } = this.getLocation();
        const state2 = this.constructState(pathname, state, search);
        return state2;
    }
    getUrlAndProps(options, state, disableNamespace) {
        const { url, ...rest } = options;
        const url2 = this.constructUrl(url, rest, disableNamespace);
        const { pathname } = this.getLocation();
        const state2 = Object.assign({}, state, {
            oakFrom: pathname,
        });
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
exports.Navigator = Navigator;
