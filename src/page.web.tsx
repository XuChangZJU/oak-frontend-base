import React from 'react';
import withRouter from './platforms/web/router/withRouter';
import PullToRefresh from './platforms/web/PullToRefresh';
import { CommonAspectDict } from 'oak-common-aspect';
import { Aspect, EntityDict } from 'oak-domain/lib/types';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
import { BasicFeatures } from './features';
import { Feature } from './types/Feature';
import {
    DataOption,
    OakComponentOption,
} from './types/Page';

import { SyncContext } from 'oak-domain/lib/store/SyncRowStore';
import { AsyncContext } from 'oak-domain/lib/store/AsyncRowStore';
import { createComponent as createReactComponent } from './page.react';

const DEFAULT_REACH_BOTTOM_DISTANCE = 50;

export function createComponent<
    IsList extends boolean,
    ED extends EntityDict & BaseEntityDict,
    T extends keyof ED,
    Cxt extends AsyncContext<ED>,
    FrontCxt extends SyncContext<ED>,
    AD extends Record<string, Aspect<ED, Cxt>>,
    FD extends Record<string, Feature>,
    FormedData extends Record<string, any>,
    TData extends Record<string, any> = {},
    TProperty extends DataOption = {},
    TMethod extends Record<string, Function> = {}
>(
    option: OakComponentOption<
        IsList,
        ED,
        T,
        Cxt,
        FrontCxt,
        AD,
        FD,
        FormedData,
        TData,
        TProperty,
        TMethod
    >,
    features: BasicFeatures<ED, Cxt, FrontCxt, AD & CommonAspectDict<ED, Cxt>> & FD,
) {
    const BaseComponent = createReactComponent<
        IsList, ED, T, Cxt, FrontCxt, AD, FD, FormedData, TData, TProperty, TMethod
    >(option, features);

    class Component extends BaseComponent {
        constructor(props) {
            super(props);
            this.handleResize = this.handleResize.bind(this);
            this.scrollEvent = this.scrollEvent.bind(this);
        }
        private scrollEvent = () => {
            this.checkReachBottom();
        };

        private handleResize() {
            const size: WechatMiniprogram.Page.IResizeOption = {
                size: {
                    windowHeight: window.innerHeight,
                    windowWidth: window.innerWidth,
                },
            };
            const { resize } = this.oakOption.lifetimes || {};
            resize && resize(size);
        }

        private registerResize() {
            window.addEventListener('resize', this.handleResize);
        }

        private unregisterResize() {
            window.removeEventListener('resize', this.handleResize);
        }

        private registerPageScroll() {
            window.addEventListener('scroll', this.scrollEvent);
        }

        private unregisterPageScroll() {
            window.removeEventListener('scroll', this.scrollEvent);
        }

        private checkReachBottom() {
            if (!this.supportPullDownRefresh()) {
                return;
            }
            const isCurrentReachBottom =
                document.body.scrollHeight -
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

        componentWillUnmount(): void {
            this.unregisterResize();
            this.unregisterPageScroll();
            super.componentWillUnmount();
        }

        render(): React.ReactNode {
            const { oakPullDownRefreshLoading } = this.state;
            const Render = super.render();
            if (this.supportPullDownRefresh()) {
                return (
                    <PullToRefresh
                        onRefresh={async () => {
                            try {
                                this.setState({
                                    oakPullDownRefreshLoading: true as any,
                                });
                                await this.refresh();
                                this.setState({
                                    oakPullDownRefreshLoading: false as any,
                                });
                            } catch (err) {
                                this.setState({
                                    oakPullDownRefreshLoading: false as any,
                                });
                                throw err;
                            }
                        }}
                        refreshing={oakPullDownRefreshLoading}
                        distanceToRefresh={DEFAULT_REACH_BOTTOM_DISTANCE}
                        indicator={{
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
                        }}
                    >
                        {Render}
                    </PullToRefresh>
                );
            }
            return Render;
        }
    }
    return withRouter(Component, option);
}