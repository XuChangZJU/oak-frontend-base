import React from 'react';
import {
    Space,
    Button,
    Modal,
    ButtonProps,
    SpaceProps,
    Dropdown,
    Typography,
} from 'antd';
import { WebComponentProps } from '../../types/Page';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
import { OakActionBtnProps } from '../../types/AbstractComponent';

import { EntityDict } from 'oak-domain/lib/types/Entity';
import Style from './web.module.less';
const { confirm } = Modal;

type Item = {
    id: string,
    label: string;
    action: string;
    type?: 'a' | 'button';
};

function ItemComponent(
    props: Item & {
        onClick: (id: string, action: string) => void;
    }
) {
    const { id, label, type, onClick, action } = props;

    if (type === 'button') {
        return (
            <Button onClick={() => onClick(id, action)}>
                {label}
            </Button>
        );
    }
    return <a onClick={() => onClick(id, action)}>
        {label}
    </a>;
}

export default function Render(
    props: WebComponentProps<
        EntityDict & BaseEntityDict,
        keyof EntityDict,
        false,
        {
            id: string;
            oakActions: OakActionBtnProps[];
            onClick: (id: string, action: string) => void;
        },
        {
        }
    >
) {
    const { methods, data } = props;
    const { t } = methods;
    const {
        id,
        oakActions,
        onClick,
    } = data;
    return (
        <div className={Style.panelContainer}>
            <Space>
                {oakActions?.map((ele, index: number) => {
                    return (
                        <ItemComponent
                            id={id}
                            label={ele.label}
                            action={ele.action}
                            type="a"
                            onClick={(id, action) => onClick(id, action)}
                        />
                    );
                })}
            </Space>
        </div>
    );
}
