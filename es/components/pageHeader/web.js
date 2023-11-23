import React from 'react';
import { Row, Col, Button } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import classNames from 'classnames';
import './index.less';
export default function Render(props) {
    const { style, className, children, title, subTitle, extra, showBack = false, onBack, backIcon, delta, contentMargin = true, contentStyle, contentClassName, tags, showHeader = true, } = props.data;
    const { t, goBack } = props.methods;
    const prefixCls = 'oak';
    return (<div style={style} className={classNames(`${prefixCls}-pageHeader`, className)}>
            {showHeader && (title || showBack || subTitle || tags || extra) && (<div className={`${prefixCls}-pageHeader-header`}>
                    <Row justify="center">
                        <Col flex="auto" className={`${prefixCls}-pageHeader-header-col`}>
                            {showBack && (<Button type="text" className={`${prefixCls}-pageHeader-header-back`} onClick={() => {
                    if (typeof onBack === 'function') {
                        onBack();
                        return;
                    }
                    goBack(delta);
                }}>
                                    {backIcon || (<ArrowLeftOutlined className={`${prefixCls}-pageHeader-header-backIcon`}/>)}
                                </Button>)}
                            {title && (<span className={`${prefixCls}-pageHeader-header-title`}>
                                    {title}
                                </span>)}
                            {subTitle && (<span className={`${prefixCls}-pageHeader-header-subTitle`}>
                                    {subTitle}
                                </span>)}
                            {tags}
                        </Col>
                        <Col flex="auto">{extra}</Col>
                    </Row>
                </div>)}

            <div style={contentStyle} className={classNames(`${prefixCls}-pageHeader-content`, contentClassName, {
            [`${prefixCls}-pageHeader-content-margin`]: contentMargin,
        })}>
                {children}
            </div>
        </div>);
}
