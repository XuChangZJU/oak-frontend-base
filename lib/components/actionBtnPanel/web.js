"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const jsx_runtime_1 = require("react/jsx-runtime");
const antd_1 = require("antd");
const web_module_less_1 = tslib_1.__importDefault(require("./web.module.less"));
const { confirm } = antd_1.Modal;
function ItemComponent(props) {
    const { type, buttonProps, render, onClick, text } = props;
    if (type === 'button') {
        return ((0, jsx_runtime_1.jsx)(antd_1.Button, { ...buttonProps, onClick: onClick, children: text }));
    }
    if (render) {
        return (0, jsx_runtime_1.jsx)("div", { onClick: onClick, children: render });
    }
    return (0, jsx_runtime_1.jsx)("a", { onClick: onClick, children: text });
}
function Render(props) {
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
        return ((0, jsx_runtime_1.jsxs)(antd_1.Space, { ...spaceProps, children: [newItems?.map((ele, index) => {
                    return ((0, jsx_runtime_1.jsx)(ItemComponent, { ...ele, onClick: ele.onClick2, text: ele.text }));
                }), moreItems && moreItems.length > 0 && ((0, jsx_runtime_1.jsx)(antd_1.Dropdown, { menu: {
                        items: moreItems.map((ele, index) => ({
                            label: ele.text,
                            key: index,
                        })),
                        onClick: (e) => {
                            const item = moreItems[e.key];
                            item.onClick2();
                        },
                    }, placement: "top", arrow: true, children: (0, jsx_runtime_1.jsx)("a", { onClick: (e) => e.preventDefault(), children: "\u66F4\u591A" }) }))] }));
    }
    return ((0, jsx_runtime_1.jsxs)("div", { className: web_module_less_1.default.panelContainer, children: [moreItems && moreItems.length > 0 && ((0, jsx_runtime_1.jsx)(antd_1.Dropdown, { menu: {
                    items: moreItems.map((ele, index) => ({
                        label: ele.text,
                        key: index,
                    })),
                    onClick: (e) => {
                        const item = moreItems[e.key];
                        item.onClick2();
                    },
                }, arrow: true, children: (0, jsx_runtime_1.jsx)(antd_1.Typography, { className: web_module_less_1.default.more, children: "\u66F4\u591A" }) })), (0, jsx_runtime_1.jsx)(antd_1.Space, { ...spaceProps, children: newItems?.map((ele, index) => {
                    return ((0, jsx_runtime_1.jsx)(ItemComponent, { type: "button", ...ele, onClick: ele.onClick2, text: ele.text }));
                }) })] }));
}
exports.default = Render;
