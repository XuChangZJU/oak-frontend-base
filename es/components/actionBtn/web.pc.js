import React, { useEffect } from 'react';
import { Space, Button, Modal, } from 'antd';
import Style from './web.module.less';
const { confirm } = Modal;
function ItemComponent(props) {
    const { label, type, onClick } = props;
    if (type === 'button') {
        return (<Button onClick={() => onClick()}>
                {label}
            </Button>);
    }
    return <a onClick={(e) => {
            onClick();
            e.stopPropagation();
            return false;
        }}>
        {label}
    </a>;
}
export default function Render(props) {
    const { methods, data } = props;
    const { t, makeItems } = methods;
    const { schema, actions, onAction, entity, cascadeActions, items, i18n, extraActions, } = data;
    const zhCNKeys = i18n?.store?.data?.zh_CN && Object.keys(i18n.store.data.zh_CN).length;
    useEffect(() => {
        makeItems();
    }, [zhCNKeys, actions, cascadeActions, extraActions]);
    return (<div className={Style.panelContainer}>
            <Space align='center' size={12} style={{ width: '100%' }} wrap>
                {items?.map((ele, index) => {
            return (<ItemComponent key={ele.action} label={ele.label} type="a" onClick={ele.onClick}/>);
        })}
            </Space>
        </div>);
}
