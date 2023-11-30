"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Navigator = void 0;
const native_1 = require("@react-navigation/native");
const navigator_common_1 = require("./navigator.common");
class Navigator extends navigator_common_1.Navigator {
    history;
    constructor() {
        super();
        this.history =
            {};
    }
    /**
     * 必须使用这个方法注入navigator
     * @param history
     */
    setHistory(history) {
        this.history = history;
    }
    getLocation() {
        const route = this.history.getCurrentRoute();
        return {
            pathname: route.name,
            state: route.params,
        };
    }
    getCurrentUrl(needParams) {
        const { pathname, state } = this.getLocation();
        if (!needParams) {
            return pathname;
        }
        // 构建search
        const search2 = this.constructSearch('', state);
        const urlParse = this.urlParse(pathname);
        urlParse.pathname = pathname;
        urlParse.search = search2;
        urlParse.searchParams.delete('oakFrom'); //把上层传入的oakFrom排除
        const url = this.urlFormat(urlParse);
        return url;
    }
    getUrlAndProps(options, state, disableNamespace) {
        const { url, ...rest } = options;
        const url2 = this.constructUrl(url, undefined, disableNamespace);
        const oakFrom = this.getCurrentUrl();
        const state2 = Object.assign({}, rest, state, { oakFrom });
        return {
            url: url2,
            props: state2,
        };
    }
    async navigateTo(options, state, disableNamespace) {
        const { url, props } = this.getUrlAndProps(options, state, disableNamespace);
        const pushAction = native_1.StackActions.push(url, props);
        this.history.dispatch(pushAction);
    }
    async redirectTo(options, state, disableNamespace) {
        const { url, props } = this.getUrlAndProps(options, state, disableNamespace);
        const replaceAction = native_1.StackActions.replace(url, props);
        this.history.dispatch(replaceAction);
    }
    async switchTab(options, state, disableNamespace) {
        const { url, props } = this.getUrlAndProps(options, state, disableNamespace);
        const jumpToAction = native_1.TabActions.jumpTo(url, props);
        this.history.dispatch(jumpToAction);
    }
    async navigateBack(delta) {
        const canGoBack = this.history.canGoBack();
        if (canGoBack) {
            const popAction = native_1.StackActions.pop(delta || 1);
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
        this.history.dispatch(native_1.StackActions.popToTop());
    }
}
exports.Navigator = Navigator;
