import React from 'react';
import {
    Space,
    Button,
    Modal,
} from 'antd';
import { WebComponentProps } from '../../types/Page';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
import { OakActionBtnProps } from '../../types/AbstractComponent';

import { EntityDict } from 'oak-domain/lib/types/Entity';
import Style from './web.module.less';
const { confirm } = Modal;

type Item = {
    label: string;
    action: string;
    type?: 'a' | 'button';
};

function ItemComponent(
    props: Item & {
        onClick: (action: string) => void;
    }
) {
    const { label, type, onClick, action } = props;

    if (type === 'button') {
        return (
            <Button onClick={() => onClick(action)}>
                {label}
            </Button>
        );
    }
    return <a onClick={() => onClick(action)}>
        {label}
    </a>;
}

function getLabel(actionItem: OakActionBtnProps, entity: string, t: (key: string) => string) {
    if (actionItem.label) {
        return actionItem.label
    }
    else {
        if (actionItem.action === ('update' || 'create')) {
            return t(`common:${actionItem.action}`)
        }
        else {
            return t(`${entity}:action.${actionItem.action}`)
        }
    }
}

export default function Render(
    props: WebComponentProps<
        EntityDict & BaseEntityDict,
        keyof EntityDict,
        false,
        {
            entity: string;
            oakActions: OakActionBtnProps[];
            onClick: (action: string) => void;
        },
        {
        }
    >
) {
    const { methods, data } = props;
    const { t } = methods;
    const {
        oakActions,
        onClick,
        entity,
    } = data;
    return (
        <div className={Style.panelContainer}>
            <Space>
                {oakActions?.map((ele, index: number) => {
                    return (
                        <ItemComponent
                            label={getLabel(ele, entity, t)}
                            action={ele.action}
                            type="a"
                            onClick={(action) => onClick(action)}
                        />
                    );
                })}
            </Space>
        </div>
    );
}
