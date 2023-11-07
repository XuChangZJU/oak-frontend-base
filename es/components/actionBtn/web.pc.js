import { jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect } from 'react';
import { Space, Button, Modal, } from 'antd';
import Style from './web.module.less';
const { confirm } = Modal;
function ItemComponent(props) {
    const { label, type, onClick } = props;
    if (type === 'button') {
        return (_jsx(Button, { onClick: () => onClick(), children: label }));
    }
    return _jsx("a", { onClick: (e) => {
            onClick();
            e.stopPropagation();
            return false;
        }, children: label });
}
export default function Render(props) {
    const { methods, data } = props;
    const { t, makeItems } = methods;
    const { schema, actions, onAction, entity, cascadeActions, items, i18n, extraActions, } = data;
    const zhCNKeys = i18n?.store?.data?.zh_CN && Object.keys(i18n.store.data.zh_CN).length;
    useEffect(() => {
        makeItems();
    }, [zhCNKeys, actions, cascadeActions, extraActions]);
    return (_jsx("div", { className: Style.panelContainer, children: _jsx(Space, { align: 'center', size: 12, style: { width: '100%' }, wrap: true, children: _jsx(_Fragment, { children: items?.map((ele, index) => {
                    return (_jsx(ItemComponent, { label: ele.label, type: "a", onClick: ele.onClick }));
                }) }) }) }));
}
