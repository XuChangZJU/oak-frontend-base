import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect } from 'react';
import { Space, Button, Divider, Popover, Typography, } from 'antd';
import { MoreOutlined, } from '@ant-design/icons';
import Style from './mobile.module.less';
export default function Render(props) {
    const { methods, data } = props;
    const { t, makeItems } = methods;
    const { width, items, moreItems, i18n, } = data;
    const isMobile = width.includes('xs');
    const zhCNKeys = i18n?.store?.data?.zh_CN && Object.keys(i18n.store.data.zh_CN).length;
    useEffect(() => {
        makeItems(isMobile);
    }, [zhCNKeys]);
    return (_jsxs("div", { className: Style.container, children: [items && items.map((ele, index) => (_jsxs(_Fragment, { children: [_jsx("div", { className: Style.btn, onClick: ele.onClick, children: _jsx(Typography.Link, { children: ele.label }) }), index !== items.length - 1 && (_jsx(Divider, { type: "vertical" }))] }))), moreItems && moreItems.length > 0 && (_jsx(Divider, { type: "vertical" })), moreItems && moreItems.length > 0 && (_jsx(Popover, { placement: 'topRight', content: _jsx(Space, { direction: "vertical", children: moreItems.map((ele) => (_jsx(Button, { size: "small", type: "link", onClick: ele.onClick, children: ele.label }))) }), trigger: "click", children: _jsx(Button, { type: "link", icon: (_jsx(MoreOutlined, {})) }) }))] }));
}
