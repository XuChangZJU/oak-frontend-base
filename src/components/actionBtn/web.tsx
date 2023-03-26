import React from 'react';
import {
    Space,
    Button,
    Modal,
} from 'antd';
import { ActionDef, WebComponentProps } from '../../types/Page';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
import { ED } from '../../types/AbstractComponent';

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
    return <a onClick={() => onClick()}>
        {label}
    </a>;
}

function getLabel(actionItem: ActionDef<ED, keyof EntityDict>, entity: string, t: (key: string) => string) {
    if (typeof actionItem !=='string') {
        return actionItem.label!
    }
    else {
        if (['update', 'create', 'detail'].includes(actionItem)) {
            return t(`common:action.${actionItem}`)
        }
        else {
            return t(`${entity}:action.${actionItem}`)
        }
    }
}

type CascadeActionDef = {
    [K in keyof EntityDict[keyof EntityDict]['Schema']]?: ActionDef<EntityDict & BaseEntityDict, keyof EntityDict>[];
}
function getLabel2(schema: StorageSchema<EntityDict & BaseEntityDict>, path: string, actionItem: ActionDef<EntityDict & BaseEntityDict, keyof EntityDict>, entity: string, t: (key: string) => string) {
    if (typeof actionItem !== 'string') {
        return actionItem.label!;
    }
    const { entity: entityI18n } = resolvePath(schema, entity, path);
    const label = t(`${entityI18n}:action.${actionItem}`)
    return label;
}

export default function Render(
    props: WebComponentProps<
        ED,
        keyof EntityDict,
        false,
        {
            schema: StorageSchema<ED>;
            entity: string;
            actions: ActionDef<ED, keyof EntityDict>[];
            cascadeActions: CascadeActionDef;
            onAction: (action?: string, cascadeAction?: CascadeActionProps) => void;
        },
        {
        }
    >
) {
    const { methods, data } = props;
    const { t } = methods;
    const {
        schema,
        actions,
        onAction,
        entity,
        cascadeActions,
    } = data;
    return (
        <div className={Style.panelContainer}>
            <Space align='center'>
                <>
                    {actions?.map((ele, index: number) => {
                        return (
                            <ItemComponent
                                label={getLabel(ele, entity, t)}
                                type="a"
                                onClick={() => {
                                    const action = typeof ele !== 'string' ? ele.action : ele;
                                    onAction(action, undefined);
                                }}
                            />
                        );
                    })}
                    {cascadeActions && Object.keys(cascadeActions).map((key, index: number) => {
                        const cascadeActionArr = cascadeActions[key];
                        if (cascadeActionArr && cascadeActionArr.length) {
                            cascadeActionArr.map((ele) => (
                                <ItemComponent
                                    label={getLabel2(schema, key, ele, entity, t)}
                                    type="a"
                                    onClick={() => {
                                        const action = typeof ele !== 'string' ? ele.action : ele;
                                        onAction(undefined, {path: key, action});
                                    }}
                                />
                            ))
                        }
                    })}
                </>
            </Space>
        </div>
    );
}
