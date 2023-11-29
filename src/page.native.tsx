import React from 'react';
import { RefreshControl, View, StyleSheet, Dimensions, ScaledSize, EmitterSubscription } from 'react-native';
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
import withRouter from './platforms/native/router/withRouter';

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
        private handleResize({
            window,
            screen,
        }: {
            window: ScaledSize;
            screen: ScaledSize;
        }) {
            const size: WechatMiniprogram.Page.IResizeOption = {
                size: {
                    windowHeight: window.height,
                    windowWidth: window.width,
                },
            };
            const { resize } = this.oakOption.lifetimes || {};
            resize && resize(size);
        }

        private registerResize() {
            (this as any).d = Dimensions.addEventListener('change', this.handleResize) as EmitterSubscription;
        }

        private unregisterResize() {
            ((this as any).d as EmitterSubscription).remove();
        }

        async componentDidMount() {
            this.registerResize();
            await super.componentDidMount();
        }

        componentWillUnmount(): void {
            this.unregisterResize();
            super.componentWillUnmount();
        }

        render(): React.ReactNode {
            const { oakPullDownRefreshLoading } = this.state;
            const Render = super.render();

            return Render;
        }
    }

    return withRouter(Component, option);
}