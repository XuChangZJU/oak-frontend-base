import React, { useEffect } from 'react';
import { Space, Button } from 'antd';

import { StorageSchema } from 'oak-domain/lib/types/Storage';

import { ActionDef, WebComponentProps } from '../../types/Page';
import {
    ED,
    OakExtraActionProps,
    CascadeActionProps,
    CascadeActionDef,
} from '../../types/AbstractComponent';
import Style from './web.module.less';

type Item = {
    label: string;
    type?: 'a' | 'button';
};

function ItemComponent(
    props: Item & {
        onClick: () => void;
    }
) {
    const { label, type, onClick } = props;

    if (type === 'button') {
        return (
            <Button onClick={() => onClick()}>
                {label}
            </Button>
        );
    }
    return <a onClick={(e) => {
        onClick()
        e.stopPropagation();
        return false;
    }}>
        {label}
    </a>;
}


export default function Render(
    props: WebComponentProps<
        ED,
        keyof ED,
        false,
        {
            i18n: any;
            items: {
                action: string;
                label: string;
                path: string;
                onClick: () => void;
            }[];
            schema: StorageSchema<ED>;
            entity: string;
            actions: ActionDef<ED, keyof ED>[];
            cascadeActions: CascadeActionDef;
            extraActions: OakExtraActionProps[];
            onAction: (
                action?: string,
                cascadeAction?: CascadeActionProps
            ) => void;
        },
        {
            makeItems: () => void;
        }
    >
) {
    const { methods, data } = props;
    const { t, makeItems } = methods;
    const {
        schema,
        actions,
        onAction,
        entity,
        cascadeActions,
        items,
        i18n,
        extraActions,
    } = data;
    const zhCNKeys: number =
        i18n?.store?.data?.zh_CN && Object.keys(i18n.store.data.zh_CN).length;
    useEffect(() => {
        makeItems();
    }, [zhCNKeys, actions, cascadeActions, extraActions]);
    return (
        <div className={Style.panelContainer}>
            <Space align="center" size={12} style={{ width: '100%' }} wrap>
                {items?.map((ele, index: number) => {
                    return (
                        <ItemComponent
                            key={ele.action}
                            label={ele.label}
                            type="a"
                            onClick={ele.onClick}
                        />
                    );
                })}
            </Space>
        </div>
    );
}
