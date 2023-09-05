import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { Row, Col, Space, Button, Modal, Breadcrumb, Tag } from 'antd';
import { Typography } from 'antd';
const { Title, Text } = Typography;
import { useState } from 'react';
import ActionAuthList from '../actionAuthList';
export default function render(props) {
    const { methods, data } = props;
    const { entity, entityDNode, entitySNode, oakFullpath, rows } = data;
    const { getNodes, checkSelectRelation } = methods;
    const [open, setOpen] = useState(false);
    const [openTip, setOpenTip] = useState(false);
    const [breadcrumbItems, setBreadcrumbItems] = useState([]);
    return (_jsxs(Space, { direction: "vertical", style: { width: '100%' }, children: [_jsx(Button, { onClick: () => setOpen(true), children: "\u8BBE\u7F6E" }), _jsx(Modal, { title: `权限设置`, open: open, destroyOnClose: true, footer: null, onCancel: () => setOpen(false), width: 900, children: _jsxs(Space, { direction: "vertical", style: { width: '100%', marginTop: 16 }, size: 16, children: [_jsxs(Space, { direction: "vertical", children: [_jsx(Text, { style: { fontSize: 16 }, children: "\u8DEF\u5F84" }), _jsx(Space, { style: { width: '100%' }, wrap: true, children: (breadcrumbItems && breadcrumbItems.length > 0) ? (_jsxs(_Fragment, { children: [_jsx(Breadcrumb, { items: breadcrumbItems.map((ele, index) => ({
                                                    title: (_jsx("a", { onClick: () => {
                                                            if (checkSelectRelation()) {
                                                                return;
                                                            }
                                                            const newItems = breadcrumbItems.slice(0, index + 1);
                                                            setBreadcrumbItems(newItems);
                                                            const entity = ele.includes('$') ? ele.split('$')[0] : ele;
                                                            getNodes(entity);
                                                        }, children: ele }))
                                                })) }), _jsx(Button, { size: "small", type: "link", onClick: () => {
                                                    setBreadcrumbItems([]);
                                                    getNodes(entity);
                                                }, children: "\u6E05\u7A7A" })] })) : (_jsx(Text, { type: "secondary", children: "\u8BF7\u5148\u9009\u62E9\u7ED3\u70B9" })) })] }), _jsx(Space, { direction: "vertical", style: { width: '100%' }, children: _jsxs(Space, { direction: "vertical", style: { width: '100%' }, children: [_jsx(Text, { style: { fontSize: 16 }, children: "\u7ED3\u70B9" }), _jsxs(Row, { gutter: 24, children: [_jsx(Col, { span: 2, children: _jsx(Text, { style: { whiteSpace: 'nowrap' }, children: "\u5916\u952E" }) }), _jsx(Col, { span: 22, children: _jsx(Space, { wrap: true, children: entityDNode.map((ele) => (_jsx(Tag, { style: { cursor: 'pointer' }, color: "processing", bordered: false, onClick: () => {
                                                            if (checkSelectRelation()) {
                                                                return;
                                                            }
                                                            breadcrumbItems.push(ele);
                                                            setBreadcrumbItems(breadcrumbItems);
                                                            getNodes(ele);
                                                        }, children: ele }))) }) })] }), _jsxs(Row, { gutter: 24, children: [_jsx(Col, { span: 2, children: _jsx(Text, { style: { whiteSpace: 'nowrap', marginRight: 16 }, children: "\u53CD\u6307\u7ED3\u70B9" }) }), _jsx(Col, { span: 22, children: _jsx(Space, { wrap: true, children: entitySNode.map((ele) => (_jsx(Tag, { style: { cursor: 'pointer' }, color: "cyan", bordered: false, onClick: () => {
                                                            if (checkSelectRelation()) {
                                                                return;
                                                            }
                                                            const preNode = breadcrumbItems[breadcrumbItems.length - 1] || entity;
                                                            const parentEntity = preNode.includes('$') ? preNode.split('$')[0] : preNode;
                                                            breadcrumbItems.push(`${ele}$${parentEntity}`);
                                                            setBreadcrumbItems(breadcrumbItems);
                                                            getNodes(ele);
                                                        }, children: ele }))) }) })] })] }) }), _jsx(ActionAuthList, { oakPath: "$actionAuthList-cpn", entity: entity, path: breadcrumbItems.join('.'), onClose: () => {
                                setOpen(false);
                            } })] }) })] }));
}
