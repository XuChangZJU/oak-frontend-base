import React from 'react';
import { Space, Button, Modal, Dropdown, Typography, } from 'antd';
import Style from './web.module.less';
const { confirm } = Modal;
function ItemComponent(props) {
    const { type, buttonProps, render, onClick, text } = props;
    if (type === 'button') {
        return (<Button {...buttonProps} onClick={onClick}>
                {text}
            </Button>);
    }
    if (render) {
        return <div onClick={onClick}>{render}</div>;
    }
    return <a onClick={onClick}>{text}</a>;
}
export default function Render(props) {
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
            .map((ele, index) => {
            const { label, action } = ele;
            let text = '';
            if (label) {
                text = label;
            }
            else {
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
                    const { title, content, okText, cancelText } = getAlertOptions(ele);
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
        let moreItems = [];
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
        return (<Space {...spaceProps}>
                {newItems?.map((ele, index) => {
                return (<ItemComponent {...ele} onClick={ele.onClick2} text={ele.text}/>);
            })}

                {moreItems && moreItems.length > 0 && (<Dropdown menu={{
                    items: moreItems.map((ele, index) => ({
                        label: ele.text,
                        key: index,
                    })),
                    onClick: (e) => {
                        const item = moreItems[e.key];
                        item.onClick2();
                    },
                }} placement="top" arrow>
                        <a onClick={(e) => e.preventDefault()}>更多</a>
                    </Dropdown>)}
            </Space>);
    }
    return (<div className={Style.panelContainer}>
            {moreItems && moreItems.length > 0 && (<Dropdown menu={{
                items: moreItems.map((ele, index) => ({
                    label: ele.text,
                    key: index,
                })),
                onClick: (e) => {
                    const item = moreItems[e.key];
                    item.onClick2();
                },
            }} arrow>
                    <Typography className={Style.more}>更多</Typography>
                </Dropdown>)}
            <Space {...spaceProps}>
                {newItems?.map((ele, index) => {
            return (<ItemComponent type="button" {...ele} onClick={ele.onClick2} text={ele.text}/>);
        })}
            </Space>
        </div>);
}
