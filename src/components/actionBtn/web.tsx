import React from 'react';
import {
    Space,
    Button,
    Modal,
    Divider,
    Popover,
    Typography,
} from 'antd';
import {
  MoreOutlined,
} from '@ant-design/icons';
import { ActionDef, WebComponentProps } from '../../types/Page';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
import { ED } from '../../types/AbstractComponent';

import { EntityDict } from 'oak-domain/lib/types/Entity';
import Style from './mobile.module.less';
import { resolvePath } from '../../utils/usefulFn';
import { StorageSchema } from 'oak-domain/lib/types/Storage';
import { CascadeActionProps } from '../../types/AbstractComponent';

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
    const items = actions.map((ele) => ({
        label: getLabel(ele, entity, t),
        onClick: () => onAction(typeof ele !== 'string' ? ele.action : ele, undefined),
    }))
    cascadeActions && Object.keys(cascadeActions).map((key, index: number) => {
        const cascadeActionArr = cascadeActions[key];
        if (cascadeActionArr && cascadeActionArr.length) {
            cascadeActionArr.forEach((ele) => {
                items.push({
                    label: getLabel2(schema, key, ele, entity, t),
                    onClick: () => onAction(undefined, {path: key, action: typeof ele !== 'string' ? ele.action : ele}),
                })
            })
        }
    })
    const moreItems = items.splice(2);
    return (
        <div className={Style.container}>
            {items && items.map((ele, index:number) => (
                <>
                    <div className={Style.btn} onClick={ele.onClick}>
                        <Typography.Link>
                            {ele.label}
                        </Typography.Link>
                    </div>
                    {index !== items.length - 1 && (
                        <Divider type="vertical"></Divider>
                    )}
                </>
            ))}
            <Divider type="vertical" />
            {moreItems && moreItems.length > 0 && (
                <Popover
                    placement='topRight'
                    content={
                        <Space direction="vertical">
                            {moreItems.map((ele) => (
                                <Button size="small" type="link" onClick={ele.onClick}>
                                    {ele.label}
                                </Button>
                            ))}
                        </Space>
                    }
                    trigger="click"
                >
                    <Button type='link' icon={<MoreOutlined />}></Button>
                </Popover>
            )}
        </div>
    );
}
