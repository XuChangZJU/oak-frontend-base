"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const antd_1 = require("antd");
const icon_1 = tslib_1.__importDefault(require("../icon"));
const classnames_1 = tslib_1.__importDefault(require("classnames"));
const web_module_less_1 = tslib_1.__importDefault(require("./web.module.less"));
const { confirm } = antd_1.Modal;
function ItemComponent(props) {
    const { icon, buttonProps, render, onClick, iconRender, iconProps, mode, text, } = props;
    if (render) {
        return (0, jsx_runtime_1.jsx)("div", { onClick: onClick, children: render });
    }
    const { style = {}, rootStyle = {}, bgColor } = iconProps || {};
    let icon2;
    if (iconRender) {
        icon2 = iconRender;
    }
    else if (typeof icon === 'string') {
        icon2 = ((0, jsx_runtime_1.jsx)(icon_1.default, { name: icon, className: (0, classnames_1.default)(web_module_less_1.default.icon, {
                [web_module_less_1.default.iconWhite]: !!bgColor,
            }), style: style }));
    }
    else {
        icon2 = icon;
    }
    return ((0, jsx_runtime_1.jsx)(antd_1.Button, { className: web_module_less_1.default.btn, type: "text", ...buttonProps, onClick: onClick, children: (0, jsx_runtime_1.jsxs)("div", { className: web_module_less_1.default.space, children: [mode === 'card' && !!icon2 ? ((0, jsx_runtime_1.jsx)("div", { className: web_module_less_1.default.iconBox, style: Object.assign({}, bgColor && {
                        backgroundColor: bgColor,
                    }, rootStyle), children: icon2 })) : (icon2), (0, jsx_runtime_1.jsx)(antd_1.Typography, { children: text })] }) }));
}
function Render(props) {
    const { methods, data } = props;
    const { t, getActionName, getAlertOptions } = methods;
    const { items, entity, rows = 2, //默认两行
    column = 5, id = 'action_tab_panel_scroll', mode = 'text', } = data;
    const [newItems, setNewItems] = (0, react_1.useState)(items);
    const [slideLeft, setSlideLeft] = (0, react_1.useState)(0);
    const [slideWidth, setSlideWidth] = (0, react_1.useState)(0);
    const [slideShow, setSlideShow] = (0, react_1.useState)(false);
    const [slideRatio, setSideRatio] = (0, react_1.useState)(0);
    const [tabNums, setTabNums] = (0, react_1.useState)([]);
    const [count, setCount] = (0, react_1.useState)(rows * column);
    (0, react_1.useEffect)(() => {
        getItems();
    }, []);
    (0, react_1.useEffect)(() => {
        getItems();
    }, [items]);
    const getItems = () => {
        const items2 = items.filter((ele) => {
            const { show } = ele;
            const showResult = ele.hasOwnProperty('show') ? show : true;
            return showResult;
        });
        const num = items2.length % count !== 0
            ? parseInt((items2.length / count).toString()) + 1
            : items2.length / count;
        const tabNums = [];
        for (let i = 1; i <= num; i++) {
            tabNums.push(i);
        }
        if (items2 && items2.length > 0) {
            const doc = window.document.getElementById(id);
            const clientWidth = (doc && doc.clientWidth) || 0;
            const totalLength = tabNums.length * clientWidth; //分类列表总长度
            const slideRatio = (50 / totalLength) * (clientWidth / window.innerWidth); //滚动列表长度与滑条长度比例
            const slideWidth = (clientWidth / totalLength) * 50; //当前显示红色滑条的长度(保留两位小数)
            setSlideWidth(slideWidth);
            setSideRatio(slideRatio);
        }
        setTabNums(tabNums);
        setNewItems([...items2]);
        setSlideShow(num > 1);
    };
    if (!newItems || newItems.length === 0) {
        return null;
    }
    return ((0, jsx_runtime_1.jsxs)("div", { className: web_module_less_1.default.tabContainer, children: [(0, jsx_runtime_1.jsx)("div", { className: web_module_less_1.default.scrollBox, children: (0, jsx_runtime_1.jsx)("div", { id: id, className: web_module_less_1.default.scrollView, onScroll: (e) => {
                        const scrollLeft = e.target.scrollLeft;
                        setSlideLeft(scrollLeft * slideRatio);
                    }, children: (0, jsx_runtime_1.jsx)("div", { className: web_module_less_1.default.tabView, children: tabNums.map((tabNum, index) => {
                            return ((0, jsx_runtime_1.jsx)("div", { className: web_module_less_1.default.btnContainer, children: newItems
                                    .filter((btn, index2) => (tabNum - 1) * count <
                                    index2 + 1 &&
                                    index2 + 1 <= tabNum * count)
                                    .map((ele, index2) => {
                                    const { label, action } = ele;
                                    let text;
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
                                            const { title, content, okText, cancelText, } = getAlertOptions(ele);
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
                                    return ((0, jsx_runtime_1.jsx)("div", { className: (0, classnames_1.default)(web_module_less_1.default.btnBox, {
                                            [web_module_less_1.default.btnBox_top]: newItems.length >
                                                column &&
                                                index2 >
                                                    column - 1,
                                        }), style: {
                                            height: `calc(100% / ${newItems.length >
                                                column
                                                ? rows
                                                : 1})`,
                                            width: `calc(100% / ${column})`,
                                        }, children: (0, jsx_runtime_1.jsx)(ItemComponent, { ...ele, onClick: onClick, mode: mode, text: text }) }, index2));
                                }) }));
                        }) }) }) }), slideShow && ((0, jsx_runtime_1.jsx)("div", { className: web_module_less_1.default.slideBar, children: (0, jsx_runtime_1.jsx)("div", { className: web_module_less_1.default.slideShow, style: {
                        width: slideWidth,
                        marginLeft: slideLeft <= 1 ? 0 : slideLeft,
                    } }) }))] }));
}
exports.default = Render;
