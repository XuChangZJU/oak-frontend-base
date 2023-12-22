"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createComponent = void 0;
const tslib_1 = require("tslib");
const jsx_runtime_1 = require("react/jsx-runtime");
const withRouter_1 = tslib_1.__importDefault(require("./platforms/web/router/withRouter"));
const PullToRefresh_1 = tslib_1.__importDefault(require("./platforms/web/PullToRefresh"));
const page_react_1 = require("./page.react");
const DEFAULT_REACH_BOTTOM_DISTANCE = 50;
function createComponent(option, features) {
    const BaseComponent = (0, page_react_1.createComponent)(option, features);
    class Component extends BaseComponent {
        scrollEvent = () => {
            this.checkReachBottom();
        };
        handleResize() {
            const size = {
                size: {
                    windowHeight: window.innerHeight,
                    windowWidth: window.innerWidth,
                },
            };
            const { resize } = this.oakOption.lifetimes || {};
            resize && resize(size);
        }
        registerResize() {
            window.addEventListener('resize', this.handleResize.bind(this));
        }
        unregisterResize() {
            window.removeEventListener('resize', this.handleResize.bind(this));
        }
        registerPageScroll() {
            window.addEventListener('scroll', this.scrollEvent.bind(this));
        }
        unregisterPageScroll() {
            window.removeEventListener('scroll', this.scrollEvent.bind(this));
        }
        checkReachBottom() {
            if (!this.supportPullDownRefresh()) {
                return;
            }
            const isCurrentReachBottom = document.body.scrollHeight -
                (window.innerHeight + window.scrollY) <=
                DEFAULT_REACH_BOTTOM_DISTANCE;
            if (!this.isReachBottom && isCurrentReachBottom && option.isList) {
                this.isReachBottom = true;
                // 执行触底事件
                this.loadMore();
                return;
            }
            this.isReachBottom = isCurrentReachBottom;
        }
        async componentDidMount() {
            this.registerResize();
            this.registerPageScroll();
            await super.componentDidMount();
        }
        componentWillUnmount() {
            this.unregisterResize();
            this.unregisterPageScroll();
            super.componentWillUnmount();
        }
        render() {
            const { oakPullDownRefreshLoading } = this.state;
            const Render = super.render();
            if (this.supportPullDownRefresh()) {
                return ((0, jsx_runtime_1.jsx)(PullToRefresh_1.default, { onRefresh: async () => {
                        try {
                            this.setState({
                                oakPullDownRefreshLoading: true,
                            });
                            await this.refresh();
                            this.setState({
                                oakPullDownRefreshLoading: false,
                            });
                        }
                        catch (err) {
                            this.setState({
                                oakPullDownRefreshLoading: false,
                            });
                            throw err;
                        }
                    }, refreshing: oakPullDownRefreshLoading, distanceToRefresh: DEFAULT_REACH_BOTTOM_DISTANCE, indicator: {
                        activate: this.t('common::ptrActivate', {
                            '#oakModule': 'oak-frontend-base',
                        }),
                        deactivate: this.t('common::ptrDeactivate', {
                            '#oakModule': 'oak-frontend-base',
                        }),
                        release: this.t('common::ptrRelease', {
                            '#oakModule': 'oak-frontend-base',
                        }),
                        finish: this.t('common::ptrFinish', {
                            '#oakModule': 'oak-frontend-base',
                        }),
                    }, children: Render }));
            }
            return Render;
        }
    }
    return (0, withRouter_1.default)(Component, option);
}
exports.createComponent = createComponent;
