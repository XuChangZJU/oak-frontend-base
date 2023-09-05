import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { memo } from 'react';
// @ts-ignore
import { useNavigate } from 'react-router-dom';
import { Row, Col, Button } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import classNames from 'classnames';
import './index.less';
export default memo((props) => {
    const { style, className, children, title, subTitle, extra, showBack = false, onBack, backIcon, delta, contentMargin = true, contentStyle, contentClassName, tags, showHeader = true, } = props;
    const prefixCls = 'oak';
    const navigate = useNavigate();
    return (_jsxs("div", { style: style, className: classNames(`${prefixCls}-pageHeader`, className), children: [showHeader && (title || showBack || subTitle || tags || extra) && (_jsx("div", { className: `${prefixCls}-pageHeader-header`, children: _jsxs(Row, { justify: "center", children: [_jsxs(Col, { flex: "auto", className: `${prefixCls}-pageHeader-header-col`, children: [showBack && (_jsx(Button, { type: "text", className: `${prefixCls}-pageHeader-header-back`, onClick: () => {
                                        if (typeof onBack === 'function') {
                                            onBack();
                                            return;
                                        }
                                        navigate(delta || -1);
                                    }, children: backIcon || (_jsx(ArrowLeftOutlined, { className: `${prefixCls}-pageHeader-header-backIcon` })) })), title && (_jsx("span", { className: `${prefixCls}-pageHeader-header-title`, children: title })), subTitle && (_jsx("span", { className: `${prefixCls}-pageHeader-header-subTitle`, children: subTitle })), tags] }), _jsx(Col, { flex: "auto", children: extra })] }) })), _jsx("div", { style: contentStyle, className: classNames(`${prefixCls}-pageHeader-content`, contentClassName, {
                    [`${prefixCls}-pageHeader-content-margin`]: contentMargin,
                }), children: children })] }));
});
