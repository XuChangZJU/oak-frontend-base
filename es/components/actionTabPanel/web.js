import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { Button, Modal, Typography, } from 'antd';
import OakIcon from '../icon';
import classNames from 'classnames';
import Style from './web.module.less';
const { confirm } = Modal;
function ItemComponent(props) {
    const { icon, buttonProps, render, onClick, iconRender, iconProps, mode, text, } = props;
    if (render) {
        return _jsx("div", { onClick: onClick, children: render });
    }
    const { style = {}, rootStyle = {}, bgColor } = iconProps || {};
    let icon2;
    if (iconRender) {
        icon2 = iconRender;
    }
    else if (typeof icon === 'string') {
        icon2 = (_jsx(OakIcon, { name: icon, className: classNames(Style.icon, {
                [Style.iconWhite]: !!bgColor,
            }), style: style }));
    }
    else {
        icon2 = icon;
    }
    return (_jsx(Button, { className: Style.btn, type: "text", ...buttonProps, onClick: onClick, children: _jsxs("div", { className: Style.space, children: [mode === 'card' && !!icon2 ? (_jsx("div", { className: Style.iconBox, style: Object.assign({}, bgColor && {
                        backgroundColor: bgColor,
                    }, rootStyle), children: icon2 })) : (icon2), _jsx(Typography, { children: text })] }) }));
}
export default function Render(props) {
    const { methods, data } = props;
    const { t, getActionName, getAlertOptions } = methods;
    const { items, entity, rows = 2, //默认两行
    column = 5, id = 'action_tab_panel_scroll', mode = 'text', } = data;
    const [newItems, setNewItems] = useState(items);
    const [slideLeft, setSlideLeft] = useState(0);
    const [slideWidth, setSlideWidth] = useState(0);
    const [slideShow, setSlideShow] = useState(false);
    const [slideRatio, setSideRatio] = useState(0);
    const [tabNums, setTabNums] = useState([]);
    const [count, setCount] = useState(rows * column);
    useEffect(() => {
        getItems();
    }, []);
    useEffect(() => {
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
    return (_jsxs("div", { className: Style.tabContainer, children: [_jsx("div", { className: Style.scrollBox, children: _jsx("div", { id: id, className: Style.scrollView, onScroll: (e) => {
                        const scrollLeft = e.target.scrollLeft;
                        setSlideLeft(scrollLeft * slideRatio);
                    }, children: _jsx("div", { className: Style.tabView, children: tabNums.map((tabNum, index) => {
                            return (_jsx("div", { className: Style.btnContainer, children: newItems
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
                                    return (_jsx("div", { className: classNames(Style.btnBox, {
                                            [Style.btnBox_top]: newItems.length >
                                                column &&
                                                index2 >
                                                    column - 1,
                                        }), style: {
                                            height: `calc(100% / ${newItems.length >
                                                column
                                                ? rows
                                                : 1})`,
                                            width: `calc(100% / ${column})`,
                                        }, children: _jsx(ItemComponent, { ...ele, onClick: onClick, mode: mode, text: text }) }, index2));
                                }) }));
                        }) }) }) }), slideShow && (_jsx("div", { className: Style.slideBar, children: _jsx("div", { className: Style.slideShow, style: {
                        width: slideWidth,
                        marginLeft: slideLeft <= 1 ? 0 : slideLeft,
                    } }) }))] }));
}
