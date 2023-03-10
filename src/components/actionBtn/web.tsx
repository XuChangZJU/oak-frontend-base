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

export default function Render(
    props: WebComponentProps<
        EntityDict & BaseEntityDict,
        keyof EntityDict,
        false,
        {
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
    } = data;
    return (
        <div className={Style.panelContainer}>
            <Space>
                {oakActions?.map((ele, index: number) => {
                    return (
                        <ItemComponent
                            label={ele.label}
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
