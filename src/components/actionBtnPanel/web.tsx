import React from 'react';
import {
    Space,
    Button,
    Modal,
    SpaceProps,
    Dropdown,
    Typography,
} from 'antd';
import { WebComponentProps } from '../../types/Page';
import { EntityDict } from 'oak-domain/lib/base-app-domain';
import Style from './web.module.less';
import { Item } from './types';

const MoreIcon = (
    <svg
        viewBox="64 64 896 896"
        focusable="false"
        data-icon="ellipsis"
        width="1em"
        height="1em"
        fill="currentColor"
        aria-hidden="true"
    >
        <path d="M176 511a56 56 0 10112 0 56 56 0 10-112 0zm280 0a56 56 0 10112 0 56 56 0 10-112 0zm280 0a56 56 0 10112 0 56 56 0 10-112 0z"></path>
    </svg>
);

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
            mode: 'cell' | 'table-cell' | 'default';
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
    const { items, spaceProps, entity, mode = 'default', column } = data;

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
                        Modal.confirm({
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
                            key={`c_ItemComponent_${index}`}
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

    if (mode === 'cell') {
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
                                key={`c_ItemComponent_${index}`}
                            />
                        );
                    })}
                </Space>
            </div>
        );

    }

    return (
        <div className={Style.panelContainer}>
            <Space {...spaceProps}>
                {newItems?.map((ele, index: number) => {
                    return (
                        <ItemComponent
                            type="button"
                            {...ele}
                            onClick={ele.onClick2}
                            text={ele.text}
                            key={`c_ItemComponent_${index}`}
                        />
                    );
                })}
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
                        <Button className={Style.btnMore}>{MoreIcon}</Button>
                    </Dropdown>
                )}
            </Space>
        </div>
    );
}
