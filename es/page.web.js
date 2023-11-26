import React from 'react';
import { withRouter, PullToRefresh } from './platforms/web';
import { createComponent as createReactComponent } from './page.react';
const DEFAULT_REACH_BOTTOM_DISTANCE = 50;
export function createComponent(option, features) {
    const BaseComponent = createReactComponent(option, features);
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
                return (<PullToRefresh onRefresh={async () => {
                        this.setState({
                            oakPullDownRefreshLoading: true,
                        });
                        await this.refresh();
                        this.setState({
                            oakPullDownRefreshLoading: false,
                        });
                    }} refreshing={oakPullDownRefreshLoading} distanceToRefresh={DEFAULT_REACH_BOTTOM_DISTANCE} indicator={{
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
                    }}>
                        {Render}
                    </PullToRefresh>);
            }
            return Render;
        }
    }
    return withRouter(Component, option);
}
