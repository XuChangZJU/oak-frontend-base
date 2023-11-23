"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createComponent = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const web_1 = require("./platforms/web");
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
            window.addEventListener('resize', this.handleResize);
        }
        unregisterResize() {
            window.removeEventListener('resize', this.handleResize);
        }
        registerPageScroll() {
            window.addEventListener('scroll', this.scrollEvent);
        }
        unregisterPageScroll() {
            window.removeEventListener('scroll', this.scrollEvent);
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
                return ((0, jsx_runtime_1.jsx)(web_1.PullToRefresh, { onRefresh: async () => {
                        this.setState({
                            oakPullDownRefreshLoading: true,
                        });
                        await this.refresh();
                        this.setState({
                            oakPullDownRefreshLoading: false,
                        });
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
    return (0, web_1.withRouter)(Component, option);
}
exports.createComponent = createComponent;
