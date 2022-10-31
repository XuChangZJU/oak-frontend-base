/// <reference path="../node_modules/@types/wechat-miniprogram/index.d.ts" />
import assert from 'assert';
import React from 'react';
import { withRouter, PullToRefresh } from './platforms/web';
import { get } from 'oak-domain/lib/utils/lodash';
import { CommonAspectDict } from 'oak-common-aspect';
import { Aspect, CheckerType, Context, DeduceSorterItem, EntityDict } from 'oak-domain/lib/types';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
import { BasicFeatures } from './features';
import { NamedFilterItem, NamedSorterItem } from './types/NamedCondition';
import { Feature, subscribe as FeactureSubscribe } from './types/Feature';
import {
    ComponentData,
    ComponentProps,
    OakComponentOption,
    OakNavigateToParameters,
} from './types/Page';

import {
    subscribe, unsubscribe, onPathSet, reRender, refresh,
    loadMore, execute, callPicker, setUpdateData, setMultiAttrUpdateData
} from './page.common';
import { MessageProps } from './types/Message';
import { NotificationProps } from './types/Notification';
import { CURRENT_LOCALE_DATA, CURRENT_LOCALE_KEY, getI18nInstanceWechatMp } from './platforms/wechatMp/i18n';


const OakProperties = {
    oakId: String,
    oakPath: String,
    oakFilters: String,
    oakSorters: String,
    oakIsPicker: Boolean,
    oakParentEntity: String,
    oakFrom: String,
    oakActions: String,
    oakAutoUnmount: Boolean,
    oakDisablePulldownRefresh: Boolean,
};

export function createComponent<
    ED extends EntityDict & BaseEntityDict,
    T extends keyof ED,
    Cxt extends Context<ED>,
    AD extends Record<string, Aspect<ED, Cxt>>,
    FD extends Record<string, Feature>,
    Proj extends ED[T]['Selection']['data'],
    FormedData extends Record<string, any>,
    IsList extends boolean,
    TData extends Record<string, any> = {},
    TProperty extends WechatMiniprogram.Component.PropertyOption = {},
    TMethod extends Record<string, Function> = {}
>(
    option: OakComponentOption<
        ED,
        T,
        Cxt,
        AD,
        FD,
        Proj,
        FormedData,
        IsList,
        TData,
        TProperty,
        TMethod
    >,
    features: BasicFeatures<ED, Cxt, AD & CommonAspectDict<ED, Cxt>> & FD,
) {
    const {
        path,
        data,
        properties,
        methods,
        lifetimes,
        observers,
        actions
    } = option;
    const { attached, show, hide, created, detached, ...restLifetimes } = lifetimes || {};

    return Component<
        WechatMiniprogram.Component.DataOption,
        WechatMiniprogram.Component.PropertyOption,
        WechatMiniprogram.Component.MethodOption,
        {
            state: Record<string, any>;
            props: {
                oakId: string;
                oakPath: string;
                oakFilters: string;
                oakSorters: string;
                oakIsPicker: boolean;
                oakParentEntity: string;
                oakFrom: string;
                oakActions: string;
                oakAutoUnmount: boolean;
                oakDisablePulldownRefresh: boolean;
            } & Record<string, any>;
            features: BasicFeatures<ED, Cxt, AD & CommonAspectDict<ED, Cxt>> & FD;
            subscribed: (() => void) | undefined;
        }>({
            data: Object.assign({}, data, {
                oakFullpath: '',
            }),
            properties: Object.assign({}, properties, OakProperties),
            methods: {
                iAmThePage() {
                    const pages = getCurrentPages();
                    if (pages[0] === this as any) {
                        return true;
                    }
                    return false;
                },
                subscribe() {
                    this.subscribed = FeactureSubscribe(() => this.reRender());
                },
                unsubscribe() {
                    if (this.subscribed) {
                        this.subscribed();
                        this.subscribed = undefined;
                    }
                },
                setState(data: Record<string, any>, callback: () => void) {
                    this.setData(data, () => {
                        this.state = this.data;
                        callback && callback.call(this);
                    });
                },
                reRender() {
                    reRender.call(this as any, option as any);
                },
                async onLoad(query: Record<string, any>) {
                    /**
                     * 小程序以props传递数据，和以页面间参数传递数据的处理不一样，都在这里处理
                     * 目前处理的还不是很完善，在实际处理中再做
                     */
                    const assignProps = (data: Record<string, any>, property: string, type: String | Boolean | Number | Object) => {
                        if (data[property]) {
                            let value = data[property];
                            if (typeof data[property] === 'string' && type !== String) {
                                switch (type) {
                                    case Boolean: {
                                        value = new Boolean(data[property]);
                                        break;
                                    }
                                    case Number: {
                                        value = new Number(data[property]);
                                        break;
                                    }
                                    case Object: {
                                        value = JSON.parse(data[property]);
                                        break;
                                    }
                                    default: {
                                        assert(false);
                                    }
                                }
                            }
                            Object.assign(this.props, {
                                [property]: value,
                            });
                        }
                    };
                    if (properties) {
                        for (const key in properties) {
                            if (query[key]) {
                                assignProps(query, key, properties[key]!);
                            }
                            else {
                                assignProps(this.data, key, properties[key]!);
                            }
                        }                        
                    }
                    for (const key in OakProperties) {
                        if (query[key]) {
                            assignProps(query, key, OakProperties[key as keyof typeof OakProperties]!);
                        }
                        else {
                            assignProps(this.data, key, OakProperties[key as keyof typeof OakProperties]!);
                        }
                    }
                    if (this.props.oakPath || (this.iAmThePage() && path)) {
                        await onPathSet.call(this as any, option as any);
                    }
                    else {
                        this.reRender();
                    }
                },
                ...methods,
            },
            observers: {
                async oakPath(data) {
                    if (data) {
                        await onPathSet.call(this as any, option as any);
                    }
                }
            },
            pageLifetimes: {
                show() {
                    this.subscribe();
                    this.reRender();
                    show && show.call(this);
                },
                hide() {
                    this.unsubscribe();
                    hide && hide.call(this);
                }
            },
            lifetimes: {
                created() {
                    const { setData } = this;
                    this.state = this.data;
                    this.features = features;
                    this.setData = (data, callback) => {
                        setData.call(this, data, () => {
                            this.state = this.data;
                            callback && callback.call(this);
                        });
                    };
                    created && created.call(this);
                },
                attached() {
                    const i18nInstance = getI18nInstanceWechatMp();
                    if (i18nInstance) {
                        (this as any).setState({
                            [CURRENT_LOCALE_KEY]: i18nInstance.currentLocale,
                            [CURRENT_LOCALE_DATA]: i18nInstance.translations,
                        });
                    }
                    attached && attached.call(this);
                },
                detached() {
                    this.unsubscribe();
                    detached && detached.call(this);
                },
                ...restLifetimes,
            },
        })
}