import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Space, Button, Modal, Dropdown, Typography, } from 'antd';
import Style from './web.module.less';
const { confirm } = Modal;
function ItemComponent(props) {
    const { type, buttonProps, render, onClick, text } = props;
    if (type === 'button') {
        return (_jsx(Button, { ...buttonProps, onClick: onClick, children: text }));
    }
    if (render) {
        return _jsx("div", { onClick: onClick, children: render });
    }
    return _jsx("a", { onClick: onClick, children: text });
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
        return (_jsxs(Space, { ...spaceProps, children: [newItems?.map((ele, index) => {
                    return (_jsx(ItemComponent, { ...ele, onClick: ele.onClick2, text: ele.text }));
                }), moreItems && moreItems.length > 0 && (_jsx(Dropdown, { menu: {
                        items: moreItems.map((ele, index) => ({
                            label: ele.text,
                            key: index,
                        })),
                        onClick: (e) => {
                            const item = moreItems[e.key];
                            item.onClick2();
                        },
                    }, placement: "top", arrow: true, children: _jsx("a", { onClick: (e) => e.preventDefault(), children: "\u66F4\u591A" }) }))] }));
    }
    return (_jsxs("div", { className: Style.panelContainer, children: [moreItems && moreItems.length > 0 && (_jsx(Dropdown, { menu: {
                    items: moreItems.map((ele, index) => ({
                        label: ele.text,
                        key: index,
                    })),
                    onClick: (e) => {
                        const item = moreItems[e.key];
                        item.onClick2();
                    },
                }, arrow: true, children: _jsx(Typography, { className: Style.more, children: "\u66F4\u591A" }) })), _jsx(Space, { ...spaceProps, children: newItems?.map((ele, index) => {
                    return (_jsx(ItemComponent, { type: "button", ...ele, onClick: ele.onClick2, text: ele.text }));
                }) })] }));
}
