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
import { EntityDict } from 'oak-domain/lib/types/Entity';
import Style from './web.module.less';
const { confirm } = Modal;

type Item = {
    icon?: string | React.ReactNode;
    label?: string;
    action?: string;
    auth: boolean;
    type?: 'a' | 'button';
    index?: number;
    alerted?: boolean;
    alertTitle?: string;
    alertContent?: string;
    confirmText?: string;
    cancelText?: string;
    render?: React.ReactNode;
    beforeAction?: (item: Item) => boolean | Promise<boolean>;
    afterAction?: (item: Item) => void;
    onClick?: (item: Item) => void | Promise<void>;
    buttonProps?: Omit<ButtonProps, 'onClick'>;
    filter?: () => boolean;
};

function ItemComponent(
    props: Item & {
        onClick: () => void | Promise<void>;
        text: string;
    }
) {
    const { type, buttonProps, render, onClick, text } = props;

    if (type === 'button') {
        return (
            <Button {...buttonProps} onClick={onClick}>
                {text}
            </Button>
        );
    }
    if (render) {
        return <div onClick={onClick}>{render}</div>;
    }
    return <a onClick={onClick}>{text}</a>;
}

export default function Render(
    props: WebComponentProps<
        EntityDict,
        keyof EntityDict,
        false,
        {
            entity: string;
            actions: string[];
            items: Item[];
            spaceProps: SpaceProps;
            mode: 'cell' | 'table-cell';
            column: 3;
        },
        {
            getActionName: (action?: string) => string;
        }
    >
) {
    const { methods, data } = props;
    const { t, getActionName } = methods;
    const {
        items,
        oakLegalActions,
        spaceProps,
        entity,
        mode = 'cell',
        column,
    } = data;

    const getItems = () => {
        const items2 = items
            .filter((ele) => {
                const { action, filter } = ele;
                const authResult =
                    !action ||
                    (action &&
                        oakLegalActions?.includes(
                            action as EntityDict[keyof EntityDict]['Action']
                        ));
                const filterResult =
                    ele.hasOwnProperty('filter') && filter ? filter() : true;
                return authResult && filterResult;
            })
            .map((ele, index: number) => {
                const { label, action } = ele;
                let text: string = '';
                if (label) {
                    text = label;
                } else {
                    text = getActionName(action);
                }
                let onClick = async () => {
                    if (ele.onClick) {
                        ele.onClick(ele);
                        return;
                    }
                    if (ele.beforeAction) {
                        const r = await ele.beforeAction(ele);
                        if (!r) {
                            return;
                        }
                    }
                    await methods.execute(
                        action as EntityDict[keyof EntityDict]['Action']
                    );

                    if (ele.afterAction) {
                        ele.afterAction(ele);
                    }
                };
                if (ele.alerted) {
                    onClick = async () => {
                        let content = '';
                        if (action) {
                            const text = getActionName(action);
                            content = `确认${text}该数据`;
                        }
                        confirm({
                            title: ele.alertTitle,
                            content: ele.alertContent || content,
                            okText: ele.confirmText || '确定',
                            cancelText: ele.cancelText || '取消',
                            onOk: async () => {
                                if (ele.onClick) {
                                    ele.onClick(ele);
                                    return;
                                }
                                if (ele.beforeAction) {
                                    const r = await ele.beforeAction(ele);
                                    if (!r) {
                                        return;
                                    }
                                }
                                await methods.execute(
                                    ele.action as EntityDict[keyof EntityDict]['Action']
                                );
                                if (ele.afterAction) {
                                    ele.afterAction(ele);
                                }
                            },
                        });
                    };
                }
                return Object.assign(ele, {
                    text: text,
                    onClick2: onClick,
                });
            });

        let newItems = items2;
        let moreItems: Item[] = [];
        if (column && items2.length > column) {
            newItems = [...items2].splice(0, column);
            moreItems = [...items2].splice(column, items2.length);
        }

        return {
            newItems,
            moreItems,
        };
    };

    const { newItems, moreItems } = getItems();

    if (!newItems || newItems.length === 0) {
        return null;
    }

    if (mode === 'table-cell') {
        return (
            <Space {...spaceProps}>
                {newItems?.map((ele, index: number) => {
                    return (
                        <ItemComponent
                            {...ele}
                            onClick={ele.onClick2}
                            text={ele.text}
                        />
                    );
                })}

                {moreItems && moreItems.length > 0 && (
                    <Dropdown
                        menu={{
                            items: moreItems.map((ele: any, index) => ({
                                label: ele.text as string,
                                key: index,
                            })),
                            onClick: (e: any) => {
                                const item = moreItems[e.key] as any;
                                item.onClick2();
                            },
                        }}
                        placement="top"
                        arrow
                    >
                        <a onClick={(e) => e.preventDefault()}>更多</a>
                    </Dropdown>
                )}
            </Space>
        );
    }

    return (
        <div className={Style.panelContainer}>
            {moreItems && moreItems.length > 0 && (
                <Dropdown
                    menu={{
                        items: moreItems.map((ele: any, index) => ({
                            label: ele.text,
                            key: index,
                        })),
                        onClick: (e: any) => {
                            const item = moreItems[e.key] as any;
                            item.onClick2();
                        },
                    }}
                    arrow
                >
                    <Typography className={Style.more}>更多</Typography>
                </Dropdown>
            )}
            <Space {...spaceProps}>
                {newItems?.map((ele, index: number) => {
                    return (
                        <ItemComponent
                            type="button"
                            {...ele}
                            onClick={ele.onClick2}
                            text={ele.text}
                        />
                    );
                })}
            </Space>
        </div>
    );
}
