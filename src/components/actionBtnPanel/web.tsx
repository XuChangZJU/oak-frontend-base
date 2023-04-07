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
import { EntityDict } from 'oak-domain/lib/base-app-domain';
import Style from './web.module.less';
import { Item } from './type';
const { confirm } = Modal;

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
            getAlertOptions: (item: Item) => {
                title: string;
                content: string;
                okText: string;
                cancelText: string;
            };
        }
    >
) {
    const { methods, data } = props;
    const { t, getActionName, getAlertOptions } = methods;
    const { items, spaceProps, entity, mode = 'cell', column } = data;

    const getItems = () => {
        const items2 = items
            .filter((ele) => {
                const { show } = ele;
                const showResult = ele.hasOwnProperty('show') ? show : true;
                return showResult;
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
                };
                if (ele.alerted) {
                    onClick = async () => {
                        const { title, content, okText, cancelText } =
                            getAlertOptions(ele);
                        confirm({
                            title,
                            content,
                            okText,
                            cancelText,
                            onOk: async () => {
                                if (ele.onClick) {
                                    ele.onClick(ele);
                                    return;
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
