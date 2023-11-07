import React, { useEffect } from 'react';
import {
    Space,
    Button,
    Modal,
} from 'antd';
import { ActionDef, WebComponentProps } from '../../types/Page';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
import { ED, OakExtraActionProps } from '../../types/AbstractComponent';

import { EntityDict } from 'oak-domain/lib/types/Entity';
import Style from './web.module.less';
import { resolvePath } from '../../utils/usefulFn';
import { StorageSchema } from 'oak-domain/lib/types/Storage';
import { CascadeActionProps } from '../../types/AbstractComponent';
const { confirm } = Modal;

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


type CascadeActionDef = {
    [K in keyof EntityDict[keyof EntityDict]['Schema']]?: ActionDef<EntityDict & BaseEntityDict, keyof EntityDict>[];
}

export default function Render(
    props: WebComponentProps<
        ED,
        keyof EntityDict,
        false,
        {
            i18n: any;
            items: { action: string; label: string, path: string; onClick: () => void }[];
            schema: StorageSchema<ED>;
            entity: string;
            actions: ActionDef<ED, keyof EntityDict>[];
            cascadeActions: CascadeActionDef;
            extraActions: OakExtraActionProps[];
            onAction: (action?: string, cascadeAction?: CascadeActionProps) => void;
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
    const zhCNKeys: number = i18n?.store?.data?.zh_CN && Object.keys(i18n.store.data.zh_CN).length;
    useEffect(() => {
        makeItems();
    }, [zhCNKeys, actions, cascadeActions, extraActions])
    return (
        <div className={Style.panelContainer}>
            <Space align='center' size={12} style={{ width: '100%' }} wrap>
                <>
                    {items?.map((ele, index: number) => {
                        return (
                            <ItemComponent
                                label={ele.label}
                                type="a"
                                onClick={ele.onClick}
                            />
                        );
                    })}
                </>
            </Space>
        </div>
    );
}
